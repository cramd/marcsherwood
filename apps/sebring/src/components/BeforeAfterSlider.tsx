import { useCallback, useRef, useState } from 'react';

interface BeforeAfterSliderProps {
	beforeSrc: string;
	afterSrc: string;
	beforeAlt: string;
	afterAlt: string;
	beforeLabel?: string;
	afterLabel?: string;
}

export default function BeforeAfterSlider({
	beforeSrc,
	afterSrc,
	beforeAlt,
	afterAlt,
	beforeLabel = 'Today',
	afterLabel = 'The goal',
}: BeforeAfterSliderProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState(50);
	const isDragging = useRef(false);

	const updatePosition = useCallback((clientX: number) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const next = ((clientX - rect.left) / rect.width) * 100;
		setPosition(Math.min(100, Math.max(0, next)));
	}, []);

	function handlePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
		isDragging.current = true;
		event.currentTarget.setPointerCapture(event.pointerId);
		updatePosition(event.clientX);
	}

	function handlePointerMove(event: React.PointerEvent<HTMLDivElement>): void {
		if (!isDragging.current) return;
		updatePosition(event.clientX);
	}

	function handlePointerUp(event: React.PointerEvent<HTMLDivElement>): void {
		isDragging.current = false;
		event.currentTarget.releasePointerCapture(event.pointerId);
	}

	return (
		<div className="w-full">
			<div
				ref={containerRef}
				className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/20 shadow-2xl shadow-black/40 select-none touch-none cursor-ew-resize bg-stone-900"
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				role="img"
				aria-label={`${beforeLabel} compared with ${afterLabel}`}
			>
				<img
					src={afterSrc}
					alt={afterAlt}
					className="absolute inset-0 h-full w-full object-cover"
					draggable={false}
				/>
				<div
					className="absolute inset-0 overflow-hidden"
					style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
				>
					<img
						src={beforeSrc}
						alt={beforeAlt}
						className="absolute inset-0 h-full w-full object-cover"
						draggable={false}
					/>
				</div>

				<div
					className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
					style={{ left: `${position}%` }}
					aria-hidden="true"
				>
					<div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--ducati-red)] shadow-lg">
						<svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M8 8l-4 4 4 4M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
				</div>

				<span className="absolute left-3 top-3 rounded bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
					{beforeLabel}
				</span>
				<span className="absolute right-3 top-3 rounded bg-[var(--ducati-red)]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
					{afterLabel}
				</span>
			</div>
			<p className="mt-2 text-center text-[11px] text-stone-400">
				Drag to compare · restored reference photo © El Caganer,{' '}
				<a
					href="https://creativecommons.org/licenses/by/2.0/"
					className="underline hover:text-stone-300"
					target="_blank"
					rel="noreferrer"
				>
					CC BY 2.0
				</a>
			</p>
		</div>
	);
}
