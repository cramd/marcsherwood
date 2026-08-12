import type { Part, PartStatus } from '../types/part';

export function countByStatus(parts: Part[]): Record<string, number> {
	return parts.reduce<Record<string, number>>((acc, part) => {
		acc[part.status] = (acc[part.status] ?? 0) + 1;
		return acc;
	}, {});
}

export function countByAssembly(parts: Part[]): Record<string, number> {
	return parts.reduce<Record<string, number>>((acc, part) => {
		acc[part.assemblyCode] = (acc[part.assemblyCode] ?? 0) + 1;
		return acc;
	}, {});
}

export function computeReadyPercent(parts: Part[]): number {
	if (parts.length === 0) return 0;
	const ready = parts.filter((p) => p.status === 'READY').length;
	return Math.round((ready / parts.length) * 100);
}

export function countNeedsAttention(parts: Part[]): number {
	const attention: PartStatus[] = ['WANTED', 'MISSING', 'ORDERED', 'IN_TRANSIT', 'CLEANING_REPAIR', 'MACHINING'];
	return parts.filter((p) => attention.includes(p.status)).length;
}

export const STATUS_COLORS: Record<string, string> = {
	WANTED: '#FDE2E2',
	MISSING: '#FECACA',
	ORDERED: '#E1EFFE',
	IN_TRANSIT: '#C7D2FE',
	RECEIVED: '#DDD6FE',
	CLEANING_REPAIR: '#FEF3C7',
	MACHINING: '#FFEDD5',
	READY: '#DEF7EC',
};
