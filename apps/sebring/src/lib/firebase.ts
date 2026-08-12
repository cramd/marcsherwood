import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	reauthenticateWithPopup,
	signOut,
	onAuthStateChanged,
	type User,
} from 'firebase/auth';
import {
	getFirestore,
	collection,
	doc,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
	orderBy,
	serverTimestamp,
	type Firestore,
} from 'firebase/firestore';
import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
	type FirebaseStorage,
} from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseConfig, isFirebaseConfigured } from './firebase-config';
import { PHOTOS_PICKER_SCOPE } from './google-photos-picker';
import type { AiSuggestion, Part, PartInput, PartStatus } from '../types/part';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initFirebase(): boolean {
	if (!isFirebaseConfigured()) return false;
	if (app) return true;

	const config = getFirebaseConfig();
	if (!config) return false;

	app = initializeApp(config);
	db = getFirestore(app);
	storage = getStorage(app);
	return true;
}

export function getDb(): Firestore {
	if (!db) throw new Error('Firebase not initialized');
	return db;
}

export function getStorageClient(): FirebaseStorage {
	if (!storage) throw new Error('Firebase not initialized');
	return storage;
}

export function getAuthClient() {
	if (!app) throw new Error('Firebase not initialized');
	return getAuth(app);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
	const auth = getAuthClient();
	return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
	const auth = getAuthClient();
	const provider = googleAuthProvider();
	const result = await signInWithPopup(auth, provider);
	return result.user;
}

function googleAuthProvider(): GoogleAuthProvider {
	const provider = new GoogleAuthProvider();
	provider.addScope(PHOTOS_PICKER_SCOPE);
	return provider;
}

/** OAuth access token with Google Photos Picker scope (may prompt for consent). */
export async function getGooglePhotosAccessToken(): Promise<string> {
	const auth = getAuthClient();
	const user = auth.currentUser;
	if (!user) throw new Error('Sign in required');

	const provider = googleAuthProvider();
	provider.setCustomParameters({ prompt: 'consent', access_type: 'online' });

	const result = user.isAnonymous
		? await signInWithPopup(auth, provider)
		: await reauthenticateWithPopup(user, provider);

	const credential = GoogleAuthProvider.credentialFromResult(result);
	const token = credential?.accessToken;
	if (!token) throw new Error('Could not obtain Google Photos access. Try signing out and back in.');
	return token;
}

export async function signOutUser(): Promise<void> {
	await signOut(getAuthClient());
}

function mapPartDoc(id: string, data: Record<string, unknown>): Part {
	return {
		id,
		photoId: (data.photoId as string) ?? '',
		storagePath: data.storagePath as string | undefined,
		thumbUrl: data.thumbUrl as string | undefined,
		assemblyCode: (data.assemblyCode as string) ?? '',
		name: (data.name as string) ?? '',
		factoryPartNumber: data.factoryPartNumber as string | undefined,
		qty: (data.qty as number) ?? 1,
		status: (data.status as PartStatus) ?? 'WANTED',
		notes: (data.notes as string) ?? '',
		source: data.source as string | undefined,
		orderedAt: data.orderedAt as string | undefined,
		receivedAt: data.receivedAt as string | undefined,
		aiSuggestion: data.aiSuggestion as AiSuggestion | undefined,
		createdAt: data.createdAt as string | undefined,
		updatedAt: data.updatedAt as string | undefined,
		createdBy: data.createdBy as string | undefined,
	};
}

export async function fetchParts(): Promise<Part[]> {
	if (!initFirebase()) return [];
	const snapshot = await getDocs(
		query(collection(getDb(), 'parts'), orderBy('updatedAt', 'desc')),
	);
	return snapshot.docs.map((d) => mapPartDoc(d.id, d.data()));
}

export async function addPart(input: PartInput, userId: string): Promise<string> {
	const docRef = await addDoc(collection(getDb(), 'parts'), {
		...input,
		createdBy: userId,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	return docRef.id;
}

export async function updatePart(id: string, input: Partial<PartInput>): Promise<void> {
	await updateDoc(doc(getDb(), 'parts', id), {
		...input,
		updatedAt: serverTimestamp(),
	});
}

export async function deletePart(id: string): Promise<void> {
	await deleteDoc(doc(getDb(), 'parts', id));
}

export async function uploadPartPhoto(file: File, photoId: string): Promise<{ url: string; path: string }> {
	const path = `parts/${photoId}`;
	const storageRef = ref(getStorageClient(), path);
	await uploadBytes(storageRef, file);
	const url = await getDownloadURL(storageRef);
	return { url, path };
}

export interface IdentifyPartResult {
	name: string;
	code: string;
	confidence: number;
	notes: string;
}

export async function identifyPart(imageBase64: string, mimeType: string, note?: string): Promise<IdentifyPartResult> {
	if (!app) throw new Error('Firebase not initialized');
	const functions = getFunctions(app);
	const identify = httpsCallable<
		{ imageBase64: string; mimeType: string; note?: string },
		IdentifyPartResult
	>(functions, 'identifyPart');
	const result = await identify({ imageBase64, mimeType, note });
	return result.data;
}

export interface FirestoreUpdate {
	id: string;
	title: string;
	body: string;
	media: string[];
	videoUrl?: string;
	publishedAt: string;
	author: string;
}

export async function fetchFirestoreUpdates(): Promise<FirestoreUpdate[]> {
	if (!initFirebase()) return [];
	const snapshot = await getDocs(
		query(collection(getDb(), 'updates'), orderBy('publishedAt', 'desc')),
	);
	return snapshot.docs.map((d) => {
		const data = d.data();
		return {
			id: d.id,
			title: (data.title as string) ?? '',
			body: (data.body as string) ?? '',
			media: (data.media as string[]) ?? [],
			videoUrl: data.videoUrl as string | undefined,
			publishedAt: (data.publishedAt as string) ?? '',
			author: (data.author as string) ?? '',
		};
	});
}

export async function addUpdate(
	input: Omit<FirestoreUpdate, 'id'>,
	userId: string,
): Promise<string> {
	const docRef = await addDoc(collection(getDb(), 'updates'), {
		...input,
		author: userId,
		publishedAt: serverTimestamp(),
	});
	return docRef.id;
}
