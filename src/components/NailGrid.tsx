import type { NailSearchRecord } from '../libs/ai/nail-search';

export interface NailGridItem {
	nail: NailSearchRecord;
	score?: number;
}

export default function NailGrid({ items }: { items: readonly NailGridItem[] }) {
	return (
		<div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{items.map(({ nail, score }) => (
				<article className="overflow-hidden rounded-lg border border-line bg-white" key={nail.slug}>
					{nail.imageSrc && (
						<img
							alt={nail.imageAlt ?? nail.description}
							className="aspect-[4/3] w-full object-cover"
							decoding="async"
							height={750}
							loading="lazy"
							src={nail.imageSrc}
							width={1000}
						/>
					)}
					<div className="p-5">
						<div className="flex items-start justify-between gap-3">
							<h3 className="font-display text-xl leading-tight">{nail.title}</h3>
							{score !== undefined && (
								<span className="shrink-0 text-xs font-semibold tabular-nums text-olive">{Math.round(score * 100)}%</span>
							)}
						</div>
						<p className="mt-2 text-sm leading-5 text-muted">{nail.description}</p>
					</div>
				</article>
			))}
		</div>
	);
}