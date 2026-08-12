import { useEffect, useState } from 'react';
import { seedInventory } from '../data/seedInventory';
import { fetchParts, initFirebase } from '../lib/firebase';
import { isFirebaseConfigured } from '../lib/firebase-config';
import type { Part } from '../types/part';
import HealthCharts from './HealthCharts';
import InventoryExplorer from './InventoryExplorer';

interface LiveInventoryProps {
	mode: 'charts' | 'table' | 'both';
	showPhotos?: boolean;
	initialParts?: Part[];
}

export default function LiveInventory({ mode, showPhotos = true, initialParts }: LiveInventoryProps) {
	const [parts, setParts] = useState<Part[]>(initialParts ?? seedInventory);
	const [loading, setLoading] = useState(isFirebaseConfigured());
	const [source, setSource] = useState<'seed' | 'firestore'>('seed');

	useEffect(() => {
		if (!isFirebaseConfigured()) {
			setLoading(false);
			return;
		}

		let active = true;

		async function load(): Promise<void> {
			try {
				initFirebase();
				const remote = await fetchParts();
				if (!active) return;
				if (remote.length > 0) {
					setParts(remote);
					setSource('firestore');
				}
			} catch {
				// fall back to seed data
			} finally {
				if (active) setLoading(false);
			}
		}

		void load();
		return () => {
			active = false;
		};
	}, []);

	if (loading) {
		return <p className="text-center text-stone-500 py-8">Loading inventory…</p>;
	}

	return (
		<div>
			{source === 'seed' && isFirebaseConfigured() && (
				<p className="text-xs text-stone-400 mb-4 font-mono">Showing sample data — add parts in Admin to go live.</p>
			)}
			{(mode === 'charts' || mode === 'both') && <HealthCharts parts={parts} />}
			{mode === 'both' && <div className="mt-12" />}
			{(mode === 'table' || mode === 'both') && <InventoryExplorer parts={parts} showPhotos={showPhotos} />}
		</div>
	);
}
