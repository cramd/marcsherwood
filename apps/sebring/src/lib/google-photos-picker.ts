const PHOTOS_PICKER_SCOPE = 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
const PICKER_API = 'https://photospicker.googleapis.com/v1';

export interface PickerSessionState {
	sessionId: string;
	pickerUrl: string;
	accessToken: string;
}

interface PollingConfig {
	pollInterval?: string;
	timeoutIn?: string;
}

interface PickingSession {
	id?: string;
	pickerUri?: string;
	pollingConfig?: PollingConfig;
	mediaItemsSet?: boolean;
}

interface PickedMediaItem {
	id?: string;
	type?: string;
	mediaFile?: {
		baseUrl?: string;
		mimeType?: string;
		filename?: string;
	};
}

interface MediaItemsListResponse {
	mediaItems?: PickedMediaItem[];
	nextPageToken?: string;
}

function parseDurationSeconds(value: string | undefined, fallbackSeconds: number): number {
	if (!value) return fallbackSeconds;
	const match = /^([\d.]+)s$/.exec(value.trim());
	if (!match) return fallbackSeconds;
	return Number.parseFloat(match[1]) * 1000;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildPickerUrl(pickerUri: string, autoclose = true): string {
	const base = pickerUri.replace(/\/$/, '');
	return autoclose ? `${base}/autoclose` : base;
}

async function pickerFetch<T>(
	path: string,
	accessToken: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${PICKER_API}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
			...(init?.headers ?? {}),
		},
	});

	if (!response.ok) {
		const body = await response.text();
		if (response.status === 403 && body.includes('SERVICE_DISABLED')) {
			throw new Error(
				'Enable Google Photos Picker API on the DVP project, wait 1–2 minutes, then retry: https://console.developers.google.com/apis/api/photospicker.googleapis.com/overview?project=928125401687',
			);
		}
		throw new Error(`Google Photos Picker error (${response.status}): ${body || response.statusText}`);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

export async function startPickerSession(accessToken: string): Promise<PickerSessionState> {
	const session = await pickerFetch<PickingSession>('/sessions', accessToken, {
		method: 'POST',
		body: JSON.stringify({
			pickingConfig: { maxItemCount: '1' },
		}),
	});

	const sessionId = session.id;
	const pickerUri = session.pickerUri;

	if (!sessionId || !pickerUri) {
		throw new Error('Could not start Google Photos picker session.');
	}

	return {
		sessionId,
		pickerUrl: buildPickerUrl(pickerUri),
		accessToken,
	};
}

export async function getPickerSession(sessionId: string, accessToken: string): Promise<PickingSession> {
	return pickerFetch<PickingSession>(`/sessions/${sessionId}`, accessToken);
}

export async function deletePickerSession(sessionId: string, accessToken: string): Promise<void> {
	await pickerFetch(`/sessions/${sessionId}`, accessToken, { method: 'DELETE' });
}

async function listPickedMediaItems(
	sessionId: string,
	accessToken: string,
): Promise<PickedMediaItem[]> {
	const items: PickedMediaItem[] = [];
	let pageToken: string | undefined;

	do {
		const params = new URLSearchParams({ sessionId });
		if (pageToken) params.set('pageToken', pageToken);
		const data = await pickerFetch<MediaItemsListResponse>(
			`/mediaItems?${params.toString()}`,
			accessToken,
		);
		if (data.mediaItems?.length) items.push(...data.mediaItems);
		pageToken = data.nextPageToken;
	} while (pageToken);

	return items;
}

export async function waitForPickerSelection(
	session: PickerSessionState,
	onPoll?: () => void,
): Promise<void> {
	const pollMs = 2000;
	const timeoutMs = 300000;
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		onPoll?.();
		const status = await getPickerSession(session.sessionId, session.accessToken);
		if (status.mediaItemsSet) return;

		const interval = parseDurationSeconds(status.pollingConfig?.pollInterval, pollMs / 1000);
		await sleep(interval);
	}

	throw new Error('Timed out waiting for Google Photos — pick a photo, tap Done, then try again.');
}

async function downloadPickedPhoto(item: PickedMediaItem): Promise<File> {
	const baseUrl = item.mediaFile?.baseUrl;
	if (!baseUrl) throw new Error('Selected item has no download URL.');

	const downloadUrl = `${baseUrl}=w1600-h1600`;
	const response = await fetch(downloadUrl);
	if (!response.ok) {
		throw new Error(`Failed to download photo (${response.status}).`);
	}

	const blob = await response.blob();
	const mimeType = item.mediaFile?.mimeType ?? blob.type ?? 'image/jpeg';
	const ext = mimeType.includes('png') ? 'png' : 'jpg';
	const filename = item.mediaFile?.filename ?? `google-photo-${Date.now()}.${ext}`;

	return new File([blob], filename, { type: mimeType });
}

export async function completePickerSession(session: PickerSessionState): Promise<File> {
	try {
		const items = await listPickedMediaItems(session.sessionId, session.accessToken);
		const photo = items.find((item) => item.type === 'PHOTO' || item.mediaFile?.mimeType?.startsWith('image/'));

		if (!photo) {
			throw new Error('No photo was selected.');
		}

		return downloadPickedPhoto(photo);
	} finally {
		await deletePickerSession(session.sessionId, session.accessToken).catch(() => undefined);
	}
}

/** Open picker in a new tab without noopener — required for Google partner-app linkage. */
export function openPickerInNewTab(pickerUrl: string): Window | null {
	return window.open(pickerUrl, '_blank');
}

export { PHOTOS_PICKER_SCOPE };
