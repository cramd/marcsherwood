import { useMemo, useState } from 'react';
import { assemblyCodes } from '../data/assemblyCodes';
import { formatStatus, statusClassName, type Part, type PartStatus } from '../types/part';

interface InventoryExplorerProps {
	parts: Part[];
	showPhotos?: boolean;
}

export default function InventoryExplorer({ parts, showPhotos = true }: InventoryExplorerProps) {
	const [search, setSearch] = useState('');
	const [assemblyFilter, setAssemblyFilter] = useState('All');
	const [statusFilter, setStatusFilter] = useState('All');

	const filtered = useMemo(() => {
		const term = search.toLowerCase();
		return parts.filter((item) => {
			const matchesSearch =
				!term ||
				item.name.toLowerCase().includes(term) ||
				item.photoId.toLowerCase().includes(term) ||
				item.notes.toLowerCase().includes(term) ||
				item.assemblyCode.toLowerCase().includes(term);
			const matchesAssembly = assemblyFilter === 'All' || item.assemblyCode === assemblyFilter;
			const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
			return matchesSearch && matchesAssembly && matchesStatus;
		});
	}, [parts, search, assemblyFilter, statusFilter]);

	return (
		<div>
			<div className="workshop-panel rounded-t-xl p-4 flex flex-wrap gap-4 items-center border-b-0">
				<div className="flex-1 min-w-[200px]">
					<input
						type="text"
						value={search}
						onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
						placeholder="Search parts, IDs, or notes..."
						className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
					/>
				</div>
				<select
					value={assemblyFilter}
					onChange={(e) => setAssemblyFilter((e.target as HTMLSelectElement).value)}
					className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
				>
					<option value="All">All assemblies</option>
					{assemblyCodes.map((item) => (
						<option key={item.code} value={item.code}>{item.code}</option>
					))}
				</select>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
					className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
				>
					<option value="All">All statuses</option>
					{(['WANTED', 'MISSING', 'ORDERED', 'IN_TRANSIT', 'RECEIVED', 'CLEANING_REPAIR', 'MACHINING', 'READY'] as PartStatus[]).map((s) => (
						<option key={s} value={s}>{formatStatus(s)}</option>
					))}
				</select>
			</div>

			<div className="overflow-x-auto workshop-panel rounded-b-xl border-t border-stone-200">
				<table className="w-full text-left border-collapse">
					<thead className="bg-stone-50 text-stone-700 text-sm uppercase">
						<tr>
							{showPhotos && <th className="px-4 py-4 font-semibold border-b w-16">Photo</th>}
							<th className="px-4 py-4 font-semibold border-b">Photo ID</th>
							<th className="px-4 py-4 font-semibold border-b">Code</th>
							<th className="px-4 py-4 font-semibold border-b">Part</th>
							<th className="px-4 py-4 font-semibold border-b">Status</th>
							<th className="px-4 py-4 font-semibold border-b text-right">Qty</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-stone-100 text-sm">
						{filtered.map((item) => (
							<tr key={item.id} className="hover:bg-stone-50 transition-colors">
								{showPhotos && (
									<td className="px-4 py-3">
										{item.thumbUrl ? (
											<img src={item.thumbUrl} alt={item.name} className="w-12 h-12 object-cover rounded border border-stone-200" />
										) : (
											<div className="w-12 h-12 bg-stone-100 rounded border border-stone-200 flex items-center justify-center font-mono text-[10px] text-stone-400">—</div>
										)}
									</td>
								)}
								<td className="px-4 py-3 font-mono text-xs text-blue-700">{item.photoId}</td>
								<td className="px-4 py-3">
									<span className="bg-stone-200 px-2 py-1 rounded text-xs font-bold">{item.assemblyCode}</span>
								</td>
								<td className="px-4 py-3">
									<div className="font-medium text-stone-900">{item.name}</div>
									<div className="text-xs text-stone-500">{item.notes}</div>
									{item.source && <div className="text-xs text-blue-600 mt-0.5">Source: {item.source}</div>}
								</td>
								<td className="px-4 py-3">
									<span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClassName(item.status)}`}>
										{formatStatus(item.status)}
									</span>
								</td>
								<td className="px-4 py-3 text-right font-medium">{item.qty}</td>
							</tr>
						))}
					</tbody>
				</table>
				{filtered.length === 0 && (
					<p className="p-8 text-center text-stone-500">No parts match your filters.</p>
				)}
			</div>
		</div>
	);
}
