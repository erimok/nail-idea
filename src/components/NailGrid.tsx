import { useState } from 'react';
import ImageLightbox, { type LightboxImage } from './ImageLightbox';
import type { NailSearchRecord } from '../libs/ai/nail-search';

export interface NailGridItem {
	nail: NailSearchRecord;
	score?: number;
}

export default function NailGrid({ items }: { items: readonly NailGridItem[] }) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const withImages = items.filter(({ nail }) => nail.imageSrc);
	const lightboxImages: LightboxImage[] = withImages.map(({ nail }) => ({
		src: nail.imageSrc as string,
		alt: nail.imageAlt ?? nail.description,
		caption: nail.title,
	}));

	return (
		<>
		<div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{items.map(({ nail, score }) => (
				<article className="overflow-hidden rounded-card border border-line bg-white p-1.5 shadow-soft" key={nail.slug}>
					{nail.imageSrc && (
						<button
							aria-label={`View full image: ${nail.title}`}
							className="group/zoom relative block w-full cursor-zoom-in rounded-[1.1rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
							type="button"
							onClick={() => setActiveIndex(withImages.findIndex((item) => item.nail.slug === nail.slug))}
						>
						<img
							alt={nail.imageAlt ?? nail.description}
							className="aspect-[4/3] w-full rounded-[1.1rem] object-cover"
							decoding="async"
							height={750}
							loading="lazy"
							src={nail.imageSrc}
							width={1000}
						/>
							<span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft transition group-hover/zoom:scale-110 group-hover/zoom:bg-white"><svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg></span>
						</button>
					)}
					<div className="px-4 pb-4 pt-3">
						<div className="flex items-start justify-between gap-3">
							<h3 className="font-display text-xl font-semibold leading-tight">{nail.title}</h3>
							{score !== undefined && (
								<span className="shrink-0 text-xs font-semibold tabular-nums text-olive">{Math.round(score * 100)}%</span>
							)}
						</div>
						<p className="mt-2 text-sm leading-5 text-muted">{nail.description}</p>
					</div>
				</article>
			))}
		</div>
		<ImageLightbox images={lightboxImages} activeIndex={activeIndex} onChange={setActiveIndex} />
		</>
	);
}