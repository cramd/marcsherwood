import { useEffect, useRef } from 'react';
import {
	Chart,
	DoughnutController,
	ArcElement,
	BarController,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
} from 'chart.js';
import { countByAssembly, countByStatus, computeReadyPercent, countNeedsAttention, STATUS_COLORS } from '../lib/inventory-stats';
import { formatStatus, type Part } from '../types/part';

Chart.register(
	DoughnutController,
	ArcElement,
	BarController,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
);

interface HealthChartsProps {
	parts: Part[];
}

export default function HealthCharts({ parts }: HealthChartsProps) {
	const statusRef = useRef<HTMLCanvasElement>(null);
	const assemblyRef = useRef<HTMLCanvasElement>(null);
	const statusChart = useRef<Chart | null>(null);
	const assemblyChart = useRef<Chart | null>(null);

	const readyPercent = computeReadyPercent(parts);
	const needsAttention = countNeedsAttention(parts);

	useEffect(() => {
		if (!statusRef.current || !assemblyRef.current) return;

		const statusCounts = countByStatus(parts);
		const assemblyCounts = countByAssembly(parts);

		statusChart.current?.destroy();
		assemblyChart.current?.destroy();

		statusChart.current = new Chart(statusRef.current, {
			type: 'doughnut',
			data: {
				labels: Object.keys(statusCounts).map(formatStatus),
				datasets: [{
					data: Object.values(statusCounts),
					backgroundColor: Object.keys(statusCounts).map((s) => STATUS_COLORS[s] ?? '#E5E7EB'),
					borderColor: '#fff',
					borderWidth: 2,
				}],
			},
			options: {
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
				},
				cutout: '70%',
			},
		});

		assemblyChart.current = new Chart(assemblyRef.current, {
			type: 'bar',
			data: {
				labels: Object.keys(assemblyCounts),
				datasets: [{
					label: 'Parts logged',
					data: Object.values(assemblyCounts),
					backgroundColor: '#CE1126',
					borderRadius: 4,
				}],
			},
			options: {
				indexAxis: 'y',
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: {
					x: { beginAtZero: true, grid: { display: false } },
					y: { grid: { display: false } },
				},
			},
		});

		return () => {
			statusChart.current?.destroy();
			assemblyChart.current?.destroy();
		};
	}, [parts]);

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div className="workshop-panel rounded-lg p-4 text-center">
					<p className="font-mono text-3xl font-bold text-[var(--ducati-red)]">{parts.length}</p>
					<p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Parts logged</p>
				</div>
				<div className="workshop-panel rounded-lg p-4 text-center">
					<p className="font-mono text-3xl font-bold text-emerald-700">{readyPercent}%</p>
					<p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Ready for assembly</p>
				</div>
				<div className="workshop-panel rounded-lg p-4 text-center">
					<p className="font-mono text-3xl font-bold text-amber-700">{needsAttention}</p>
					<p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Need attention</p>
				</div>
				<div className="workshop-panel rounded-lg p-4 text-center">
					<p className="font-mono text-3xl font-bold text-blue-700">
						{parts.filter((p) => ['ORDERED', 'IN_TRANSIT'].includes(p.status)).length}
					</p>
					<p className="text-xs text-stone-500 uppercase tracking-wider mt-1">On order / in transit</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="workshop-panel rounded-xl p-6">
					<h3 className="text-lg font-semibold mb-4 text-center">Parts status breakdown</h3>
					<div className="relative w-full h-[300px] md:h-[350px]">
						<canvas ref={statusRef} />
					</div>
				</div>
				<div className="workshop-panel rounded-xl p-6">
					<h3 className="text-lg font-semibold mb-4 text-center">Inventory by assembly area</h3>
					<div className="relative w-full h-[300px] md:h-[350px]">
						<canvas ref={assemblyRef} />
					</div>
				</div>
			</div>
		</div>
	);
}
