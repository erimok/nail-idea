import { stepIndex } from '../../components/gallery-navigation';

export const GALLERY_TRIGGER = '[data-gallery-src]';

interface GalleryElements {
	dialog: HTMLDialogElement;
	image: HTMLImageElement;
	caption: HTMLElement;
}

function readElements(dialog: HTMLDialogElement): GalleryElements | undefined {
	const image = dialog.querySelector<HTMLImageElement>('[data-gallery-image]');
	const caption = dialog.querySelector<HTMLElement>('[data-gallery-caption]');
	return image && caption ? { dialog, image, caption } : undefined;
}

/**
 * Progressive enhancement for a server-rendered grid: any element inside `root`
 * with data-gallery-src/alt/caption opens the shared <dialog> on click.
 */
export function initGridGallery(root: HTMLElement, dialog: HTMLDialogElement): void {
	const elements = readElements(dialog);
	if (!elements) return;
	const { image, caption } = elements;
	let triggers: HTMLElement[] = [];
	let index = 0;

	function show(next: number): void {
		const trigger = triggers[next];
		if (!trigger) return;
		index = next;
		image.src = trigger.dataset.gallerySrc ?? '';
		image.alt = trigger.dataset.galleryAlt ?? '';
		caption.textContent = `${trigger.dataset.galleryCaption ?? ''} (${next + 1} / ${triggers.length})`;
	}

	function close(): void {
		if (dialog.open) dialog.close();
		image.removeAttribute('src');
	}

	root.addEventListener('click', (event) => {
		const trigger = (event.target as Element).closest<HTMLElement>(GALLERY_TRIGGER);
		if (!trigger || !root.contains(trigger)) return;
		triggers = [...root.querySelectorAll<HTMLElement>(GALLERY_TRIGGER)]
			.filter((candidate) => !candidate.closest('[hidden]'));
		show(triggers.indexOf(trigger));
		dialog.showModal();
	});

	dialog.addEventListener('click', (event) => {
		const target = event.target as Element;
		if (target === dialog || target.closest('[data-gallery-close]')) close();
		else if (target.closest('[data-gallery-prev]')) show(stepIndex(index, -1, triggers.length));
		else if (target.closest('[data-gallery-next]')) show(stepIndex(index, 1, triggers.length));
	});

	dialog.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') show(stepIndex(index, -1, triggers.length));
		if (event.key === 'ArrowRight') show(stepIndex(index, 1, triggers.length));
	});
}
