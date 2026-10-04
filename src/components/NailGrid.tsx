import type { NailRecord } from '../libs/ai/nail-search';

export interface NailGridItem {
	nail: NailRecord;
	score?: number;
}

export default function NailGrid({ items }: { items: readonly NailGridItem[] }) {
	return (
		<div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{items.map(({ nail, score }) => (
				<article className="overflow-hidden rounded-lg border border-[#d9dfd4] bg-white" key={nail.slug}>
					<img
						alt={nail.title}
						className="aspect-[4/3] w-full object-cover"
						decoding="async"
						loading="lazy"
						src={nail.image}
					/>
					<div className="p-5">
						<div className="flex items-start justify-between gap-3">
							<h3 className="font-display text-xl leading-tight">{nail.title}</h3>
							{score !== undefined && (
								<span className="shrink-0 text-xs font-semibold tabular-nums text-[#718b42]">{Math.round(score * 100)}%</span>
							)}
						</div>
						<p className="mt-2 text-sm leading-5 text-[#617269]">{nail.description}</p>
					</div>
				</article>
			))}
		</div>
	);
}