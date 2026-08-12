import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp } from 'firebase-admin/app';
import { defineSecret } from 'firebase-functions/params';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

initializeApp();

const geminiApiKey = defineSecret('GEMINI_API_KEY');

const ASSEMBLY_CODES = [
	'ENG', 'GBX', 'FF', 'RW / FW', 'HC', 'CS-RB-FR', 'LH', 'ELEC', 'CARB', 'EXH',
];

interface IdentifyRequest {
	imageBase64: string;
	mimeType: string;
	note?: string;
}

interface IdentifyResponse {
	name: string;
	code: string;
	confidence: number;
	notes: string;
}

export const identifyPart = onCall(
	{ cors: true, maxInstances: 10, secrets: [geminiApiKey] },
	async (request): Promise<IdentifyResponse> => {
		if (!request.auth) {
			throw new HttpsError('unauthenticated', 'Sign in required.');
		}

		const { imageBase64, mimeType, note } = request.data as IdentifyRequest;
		if (!imageBase64 || !mimeType) {
			throw new HttpsError('invalid-argument', 'imageBase64 and mimeType are required.');
		}

		const apiKey = geminiApiKey.value();
		if (!apiKey) {
			throw new HttpsError('failed-precondition', 'GEMINI_API_KEY not configured on Cloud Functions.');
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

		const prompt = `You are an expert on vintage Ducati motorcycles, specifically the 1965 Sebring 350 single-cylinder bevel-drive engine.

Analyze this motorcycle part photo and identify:
1. The most likely part name
2. Which factory assembly code it belongs to (choose exactly one from: ${ASSEMBLY_CODES.join(', ')})
3. A brief note about condition, markings, or sourcing tips

${note ? `Additional context from the mechanic: ${note}` : ''}

Respond in JSON only with this exact shape:
{"name":"...","code":"ENG","confidence":0.85,"notes":"..."}

confidence is 0-1. Use ENG for engine parts, CARB for carburetor, etc.`;

		try {
			const result = await model.generateContent([
				{ text: prompt },
				{
					inlineData: {
						mimeType,
						data: imageBase64,
					},
				},
			]);

			const text = result.response.text();
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new HttpsError('internal', 'Could not parse AI response.');
			}

			const parsed = JSON.parse(jsonMatch[0]) as IdentifyResponse;
			const code = ASSEMBLY_CODES.includes(parsed.code) ? parsed.code : 'ENG';

			return {
				name: parsed.name ?? 'Unknown part',
				code,
				confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
				notes: parsed.notes ?? '',
			};
		} catch (err) {
			if (err instanceof HttpsError) throw err;
			throw new HttpsError('internal', err instanceof Error ? err.message : 'Identify failed.');
		}
	},
);
