import { useEffect, useRef } from 'react';
import { stepIndex } from './gallery-navigation';

export interface LightboxImage {
	src: string;
	alt: string;
	caption?: string;
}

interface ImageLightboxProps {
	images: readonly LightboxImage[];
	/** Index of the open image, or null when closed. */
	activeIndex: number | null;
	onChange: (index: number | null) => void;
}

const controlClass =
	'absolute flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-soft transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export default function ImageLightbox({ images, activeIndex, onChange }: ImageLightboxProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const isOpen = activeIndex !== null && images[activeIndex] !== undefined;

	// Native <dialog> provides focus trapping, inert background, Esc handling and focus restore.
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (isOpen && !dialog.open) dialog.showModal?.();
		if (!isOpen && dialog.open) dialog.close?.();
	}, [isOpen]);

	const image = isOpen ? images[activeIndex] : undefined;
	const step = (delta: number) => onChange(stepIndex(activeIndex ?? 0, delta, images.length));
	const hasMany = images.length > 1;

	return (
		<dialog
			ref={dialogRef}
			aria-label="Image gallery"
			className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/90"
			onCancel={(event) => {
				event.preventDefault();
				onChange(null);
			}}
			onClick={(event) => {
				if (event.target === event.currentTarget) onChange(null);
			}}
			onKeyDown={(event) => {
				if (!hasMany) return;
				if (event.key === 'ArrowRight') step(1);
				if (event.key === 'ArrowLeft') step(-1);
			}}
		>
			{image && (
				<figure className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 sm:p-10">
					<img alt={image.alt} className="max-h-[80dvh] max-w-full rounded-card object-contain" src={image.src} />
					<figcaption className="text-center text-sm text-white">
						{image.caption}
						{hasMany && <span className="ml-2 tabular-nums opacity-70">{(activeIndex ?? 0) + 1} / {images.length}</span>}
					</figcaption>
				</figure>
			)}
			<button aria-label="Close gallery" className={`${controlClass} right-4 top-4`} type="button" onClick={() => onChange(null)}>
				<span aria-hidden="true">×</span>
			</button>
			{hasMany && (
				<>
					<button aria-label="Previous image" className={`${controlClass} left-4 top-1/2 -translate-y-1/2`} type="button" onClick={() => step(-1)}>
						<span aria-hidden="true">‹</span>
					</button>
					<button aria-label="Next image" className={`${controlClass} right-4 top-1/2 -translate-y-1/2`} type="button" onClick={() => step(1)}>
						<span aria-hidden="true">›</span>
					</button>
				</>
			)}
		</dialog>
	);
}
