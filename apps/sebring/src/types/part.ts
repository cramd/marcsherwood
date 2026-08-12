export type PartStatus =
	| 'WANTED'
	| 'MISSING'
	| 'ORDERED'
	| 'IN_TRANSIT'
	| 'RECEIVED'
	| 'CLEANING_REPAIR'
	| 'MACHINING'
	| 'READY';

export interface AiSuggestion {
	name: string;
	code: string;
	confidence: number;
	raw?: string;
}

export interface Part {
	id: string;
	photoId: string;
	storagePath?: string;
	thumbUrl?: string;
	assemblyCode: string;
	name: string;
	factoryPartNumber?: string;
	qty: number;
	status: PartStatus;
	notes: string;
	source?: string;
	orderedAt?: string;
	receivedAt?: string;
	aiSuggestion?: AiSuggestion;
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
}

export interface PartInput {
	photoId: string;
	assemblyCode: string;
	name: string;
	factoryPartNumber?: string;
	qty: number;
	status: PartStatus;
	notes: string;
	source?: string;
	thumbUrl?: string;
	storagePath?: string;
}

export const PART_STATUSES: PartStatus[] = [
	'WANTED',
	'MISSING',
	'ORDERED',
	'IN_TRANSIT',
	'RECEIVED',
	'CLEANING_REPAIR',
	'MACHINING',
	'READY',
];

export function formatStatus(status: PartStatus): string {
	return status.replace(/_/g, ' ');
}

export function statusClassName(status: PartStatus): string {
	return `status-${status.toLowerCase().replace(/_/g, '-')}`;
}
