export interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
}

export function getFirebaseConfig(): FirebaseConfig | null {
	const config: FirebaseConfig = {
		apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY ?? '',
		authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
		projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? '',
		storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
		messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
		appId: import.meta.env.PUBLIC_FIREBASE_APP_ID ?? '',
	};

	if (!config.apiKey || !config.projectId) {
		return null;
	}

	return config;
}

export function isFirebaseConfigured(): boolean {
	return getFirebaseConfig() !== null;
}
