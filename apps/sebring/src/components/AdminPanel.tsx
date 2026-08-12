import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { assemblyCodes } from '../data/assemblyCodes';
import {
	addPart,
	deletePart,
	fetchParts,
	getGooglePhotosAccessToken,
	identifyPart,
	initFirebase,
	signInWithGoogle,
	signOutUser,
	subscribeToAuth,
	updatePart,
	uploadPartPhoto,
} from '../lib/firebase';
import {
	completePickerSession,
	openPickerInNewTab,
	startPickerSession,
	waitForPickerSelection,
	type PickerSessionState,
} from '../lib/google-photos-picker';
import { isFirebaseConfigured } from '../lib/firebase-config';
import { formatStatus, PART_STATUSES, type Part, type PartInput, type PartStatus } from '../types/part';

const emptyForm: PartInput = {
	photoId: '',
	assemblyCode: 'ENG',
	name: '',
	qty: 1,
	status: 'WANTED',
	notes: '',
};

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			resolve(result.split(',')[1] ?? '');
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export default function AdminPanel() {
	const [user, setUser] = useState<User | null>(null);
	const [parts, setParts] = useState<Part[]>([]);
	const [form, setForm] = useState<PartInput>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiSuggestion, setAiSuggestion] = useState<{ name: string; code: string; confidence: number; notes: string } | null>(null);
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);
	const [pickerLoading, setPickerLoading] = useState(false);
	const [pickerSession, setPickerSession] = useState<PickerSessionState | null>(null);
	const [pickerWaiting, setPickerWaiting] = useState(false);
	const pickerAbort = useRef(false);

	const configured = isFirebaseConfigured();

	useEffect(() => {
		if (!configured) return;
		initFirebase();
		return subscribeToAuth(setUser);
	}, [configured]);

	useEffect(() => {
		if (!user) return;
		void refreshParts();
	}, [user]);

	useEffect(() => {
		return () => {
			pickerAbort.current = true;
		};
	}, []);

	async function beginGooglePhotosPicker(): Promise<void> {
		setPickerLoading(true);
		setMessage('');
		pickerAbort.current = false;
		try {
			const accessToken = await getGooglePhotosAccessToken();
			const session = await startPickerSession(accessToken);
			setPickerSession(session);
			setMessage('Click “Open Google Photos” — use the same Google account you signed in with.');
			void waitForPickerCompletion(session);
		} catch (err) {
			setMessage(err instanceof Error ? err.message : 'Google Photos picker failed.');
		} finally {
			setPickerLoading(false);
		}
	}

	function handleOpenGooglePhotos(): void {
		if (!pickerSession) return;
		const opened = openPickerInNewTab(pickerSession.pickerUrl);
		if (!opened) {
			setMessage('Popup blocked — use the link below or allow popups for this site.');
			return;
		}
		setMessage('Google Photos opened — select a photo, then tap Done. This page will update automatically.');
	}

	async function waitForPickerCompletion(session: PickerSessionState): Promise<void> {
		if (pickerWaiting) return;
		setPickerWaiting(true);
		try {
			await waitForPickerSelection(session, () => {
				if (!pickerAbort.current) {
					setMessage('Waiting for your photo selection in Google Photos…');
				}
			});
			if (pickerAbort.current) return;
			const file = await completePickerSession(session);
			await handlePhotoChange(file);
			setPickerSession(null);
			setMessage('Photo selected from Google Photos.');
		} catch (err) {
			if (!pickerAbort.current) {
				setMessage(err instanceof Error ? err.message : 'Google Photos picker failed.');
			}
		} finally {
			setPickerWaiting(false);
		}
	}

	function cancelGooglePhotosPicker(): void {
		pickerAbort.current = true;
		setPickerSession(null);
		setPickerWaiting(false);
		setMessage('Google Photos picker cancelled.');
	}

	async function refreshParts(): Promise<void> {
		const data = await fetchParts();
		setParts(data);
	}

	function resetForm(): void {
		setForm(emptyForm);
		setEditingId(null);
		setPhotoFile(null);
		setPreviewUrl(null);
		setAiSuggestion(null);
	}

	async function handlePhotoChange(file: File | null): Promise<void> {
		setPhotoFile(file);
		if (file) {
			setPreviewUrl(URL.createObjectURL(file));
			if (!form.photoId) {
				const id = `IMG_${Date.now()}.jpg`;
				setForm((f) => ({ ...f, photoId: id }));
			}
		} else {
			setPreviewUrl(null);
		}
	}

	async function handleGooglePhotosPick(): Promise<void> {
		if (pickerSession) {
			handleOpenGooglePhotos();
			return;
		}
		await beginGooglePhotosPicker();
	}

	async function handleIdentify(): Promise<void> {
		if (!photoFile) {
			setMessage('Add a photo first.');
			return;
		}
		setAiLoading(true);
		setMessage('');
		try {
			const base64 = await fileToBase64(photoFile);
			const result = await identifyPart(base64, photoFile.type, form.notes);
			setAiSuggestion(result);
			setMessage(`AI suggestion (${Math.round(result.confidence * 100)}% confidence) — review before saving.`);
		} catch (err) {
			setMessage(err instanceof Error ? err.message : 'Identify failed. Check Firebase Functions setup.');
		} finally {
			setAiLoading(false);
		}
	}

	function applySuggestion(): void {
		if (!aiSuggestion) return;
		setForm((f) => ({
			...f,
			name: aiSuggestion.name,
			assemblyCode: aiSuggestion.code,
			notes: aiSuggestion.notes || f.notes,
		}));
		setMessage('Suggestion applied — confirm and save.');
	}

	async function handleSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		if (!user) return;
		setBusy(true);
		setMessage('');
		try {
			let thumbUrl = form.thumbUrl;
			let storagePath = form.storagePath;
			if (photoFile && form.photoId) {
				const uploaded = await uploadPartPhoto(photoFile, form.photoId);
				thumbUrl = uploaded.url;
				storagePath = uploaded.path;
			}
			const payload: PartInput = { ...form, thumbUrl, storagePath };
			if (editingId) {
				await updatePart(editingId, payload);
				setMessage('Part updated.');
			} else {
				await addPart(payload, user.uid);
				setMessage('Part added.');
			}
			resetForm();
			await refreshParts();
		} catch (err) {
			setMessage(err instanceof Error ? err.message : 'Save failed.');
		} finally {
			setBusy(false);
		}
	}

	function startEdit(part: Part): void {
		setEditingId(part.id);
		setForm({
			photoId: part.photoId,
			assemblyCode: part.assemblyCode,
			name: part.name,
			factoryPartNumber: part.factoryPartNumber,
			qty: part.qty,
			status: part.status,
			notes: part.notes,
			source: part.source,
			thumbUrl: part.thumbUrl,
			storagePath: part.storagePath,
		});
		setPreviewUrl(part.thumbUrl ?? null);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function handleDelete(id: string): Promise<void> {
		if (!confirm('Delete this part?')) return;
		await deletePart(id);
		await refreshParts();
		setMessage('Part deleted.');
	}

	if (!configured) {
		return (
			<div className="workshop-panel rounded-xl p-8 max-w-2xl mx-auto">
				<h2 className="text-xl font-bold mb-4">Firebase not configured</h2>
				<p className="text-stone-600 mb-4">
					Admin needs Firebase for sign-in, parts storage, and photo uploads. Run this once from your machine:
				</p>
				<pre className="bg-stone-900 text-stone-100 text-sm p-4 rounded-lg overflow-x-auto mb-4 font-mono">
{`cd apps/sebring
firebase login --reauth
npm run setup:firebase
npm run deploy`}
				</pre>
				<p className="text-sm text-stone-500 mb-2">
					Or manually: copy <code className="font-mono bg-stone-100 px-1 rounded">.env.example</code> to <code className="font-mono bg-stone-100 px-1 rounded">.env</code>, paste your web app config from{' '}
					<a href="https://console.firebase.google.com" className="text-[var(--ducati-red)] underline" target="_blank" rel="noopener noreferrer">Firebase Console</a>, then rebuild and deploy.
				</p>
				<p className="text-xs text-stone-400">
					<code className="font-mono">PUBLIC_*</code> variables are baked in at build time — you must run <code className="font-mono">npm run deploy</code> after creating <code className="font-mono">.env</code>.
				</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="workshop-panel rounded-xl p-12 max-w-md mx-auto text-center">
				<h2 className="text-2xl font-bold mb-2">Admin</h2>
				<p className="text-stone-600 mb-6">Sign in to catalog parts, upload photos, and post updates.</p>
				<button
					type="button"
					onClick={() => void signInWithGoogle()}
					className="px-6 py-3 bg-[var(--ducati-red)] text-white font-semibold rounded hover:bg-red-700 transition-colors"
				>
					Sign in with Google
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold">Admin</h2>
					<p className="text-sm text-stone-500">{user.email}</p>
				</div>
				<button type="button" onClick={() => void signOutUser()} className="text-sm text-stone-500 hover:text-[var(--ducati-red)]">
					Sign out
				</button>
			</div>

			{message && <p className="text-sm text-stone-600 bg-stone-100 px-4 py-2 rounded">{message}</p>}

			<form onSubmit={(e) => void handleSubmit(e)} className="workshop-panel rounded-xl p-6 space-y-4">
				<h3 className="text-lg font-semibold">{editingId ? 'Edit part' : 'Add part'}</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="block">
						<span className="text-sm font-medium">Photo</span>
						<div className="mt-2 flex flex-wrap gap-2">
							<label className="inline-flex items-center px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-stone-50">
								Upload / camera
								<input
									type="file"
									accept="image/*"
									capture="environment"
									onChange={(e) => void handlePhotoChange(e.target.files?.[0] ?? null)}
									className="sr-only"
								/>
							</label>
							<button
								type="button"
								onClick={() => void handleGooglePhotosPick()}
								disabled={pickerLoading || pickerWaiting || busy}
								className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50"
							>
								{pickerLoading ? 'Starting…' : pickerWaiting ? 'Waiting for photo…' : 'Pick from Google Photos'}
							</button>
						</div>
						{pickerSession && (
							<div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-3">
								<p className="text-blue-900 font-medium">Step 1: Open Google Photos</p>
								<p className="text-blue-800 text-xs">
									Use the same Google account as admin sign-in. Search for your workshop album if needed, select one photo, then tap <strong>Done</strong>.
								</p>
								<div className="flex flex-wrap gap-2">
									<button
										type="button"
										onClick={handleOpenGooglePhotos}
										className="px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800"
									>
										Open Google Photos
									</button>
									<a
										href={pickerSession.pickerUrl}
										target="_blank"
										rel="noreferrer"
										className="px-4 py-2 border border-blue-300 text-blue-800 rounded-lg font-medium hover:bg-white"
									>
										Open as link
									</a>
									<button
										type="button"
										onClick={cancelGooglePhotosPicker}
										className="px-4 py-2 text-stone-600 hover:text-stone-900"
									>
										Cancel
									</button>
								</div>
								{pickerWaiting && (
									<p className="text-xs text-blue-700 animate-pulse">Waiting for selection… keep this tab open.</p>
								)}
							</div>
						)}
						<p className="mt-2 text-xs text-stone-500">
							Use Google Photos for shots already on your phone or in the workshop album.
						</p>
						<p className="mt-1 text-xs text-stone-400">
							If you see “go back to the partner app”, click <strong>Open Google Photos</strong> here — don’t open the picker from a bookmark or another tab.
						</p>
					</div>
					{previewUrl && (
						<div>
							<img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded border" />
							<button
								type="button"
								onClick={() => void handleIdentify()}
								disabled={aiLoading}
								className="mt-2 text-sm text-[var(--ducati-red)] font-medium hover:underline disabled:opacity-50"
							>
								{aiLoading ? 'Identifying…' : 'AI identify part'}
							</button>
						</div>
					)}
				</div>

				{aiSuggestion && (
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
						<p><strong>Suggested:</strong> {aiSuggestion.name} ({aiSuggestion.code})</p>
						<p className="text-stone-600 mt-1">{aiSuggestion.notes}</p>
						<button type="button" onClick={applySuggestion} className="mt-2 text-[var(--ducati-red)] font-medium hover:underline">
							Apply suggestion
						</button>
					</div>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label className="block">
						<span className="text-sm font-medium">Photo ID</span>
						<input
							required
							value={form.photoId}
							onChange={(e) => setForm({ ...form, photoId: e.target.value })}
							className="mt-1 w-full px-3 py-2 border rounded-lg"
							placeholder="IMG_0001.jpg"
						/>
					</label>
					<label className="block">
						<span className="text-sm font-medium">Assembly code</span>
						<select
							value={form.assemblyCode}
							onChange={(e) => setForm({ ...form, assemblyCode: e.target.value })}
							className="mt-1 w-full px-3 py-2 border rounded-lg"
						>
							{assemblyCodes.map((a) => (
								<option key={a.code} value={a.code}>{a.code} — {a.area}</option>
							))}
						</select>
					</label>
					<label className="block sm:col-span-2">
						<span className="text-sm font-medium">Part name</span>
						<input
							required
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							className="mt-1 w-full px-3 py-2 border rounded-lg"
						/>
					</label>
					<label className="block">
						<span className="text-sm font-medium">Qty</span>
						<input
							type="number"
							min={1}
							value={form.qty}
							onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
							className="mt-1 w-full px-3 py-2 border rounded-lg"
						/>
					</label>
					<label className="block">
						<span className="text-sm font-medium">Status</span>
						<select
							value={form.status}
							onChange={(e) => setForm({ ...form, status: e.target.value as PartStatus })}
							className="mt-1 w-full px-3 py-2 border rounded-lg"
						>
							{PART_STATUSES.map((s) => (
								<option key={s} value={s}>{formatStatus(s)}</option>
							))}
						</select>
					</label>
					<label className="block sm:col-span-2">
						<span className="text-sm font-medium">Notes</span>
						<textarea
							value={form.notes}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
							rows={2}
							className="mt-1 w-full px-3 py-2 border rounded-lg"
						/>
					</label>
					<label className="block sm:col-span-2">
						<span className="text-sm font-medium">Source (optional)</span>
						<input
							value={form.source ?? ''}
							onChange={(e) => setForm({ ...form, source: e.target.value })}
							className="mt-1 w-full px-3 py-2 border rounded-lg"
							placeholder="Bevel Heaven, eBay, etc."
						/>
					</label>
				</div>

				<div className="flex gap-3">
					<button
						type="submit"
						disabled={busy}
						className="px-6 py-2 bg-[var(--ducati-red)] text-white font-semibold rounded hover:bg-red-700 disabled:opacity-50"
					>
						{busy ? 'Saving…' : editingId ? 'Update part' : 'Add part'}
					</button>
					{editingId && (
						<button type="button" onClick={resetForm} className="px-6 py-2 border rounded hover:bg-stone-50">
							Cancel edit
						</button>
					)}
				</div>
			</form>

			<div className="workshop-panel rounded-xl overflow-hidden">
				<h3 className="text-lg font-semibold p-4 border-b">Catalogued parts ({parts.length})</h3>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-stone-50">
							<tr>
								<th className="px-4 py-2 text-left">Photo</th>
								<th className="px-4 py-2 text-left">Name</th>
								<th className="px-4 py-2 text-left">Status</th>
								<th className="px-4 py-2 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{parts.map((part) => (
								<tr key={part.id}>
									<td className="px-4 py-2">
										{part.thumbUrl ? (
											<img src={part.thumbUrl} alt="" className="w-10 h-10 object-cover rounded" />
										) : (
											<span className="font-mono text-xs text-stone-400">{part.photoId}</span>
										)}
									</td>
									<td className="px-4 py-2">
										<div className="font-medium">{part.name}</div>
										<div className="text-xs text-stone-500">{part.assemblyCode}</div>
									</td>
									<td className="px-4 py-2">{formatStatus(part.status)}</td>
									<td className="px-4 py-2 text-right space-x-2">
										<button type="button" onClick={() => startEdit(part)} className="text-blue-600 hover:underline">Edit</button>
										<button type="button" onClick={() => void handleDelete(part.id)} className="text-red-600 hover:underline">Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{parts.length === 0 && <p className="p-6 text-stone-500 text-center">No parts yet.</p>}
				</div>
			</div>
		</div>
	);
}
