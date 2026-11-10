// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { initGridGallery } from './grid-gallery';

function setup() {
	document.body.innerHTML = `
		<div id="root">
			<button data-gallery-src="/a.webp" data-gallery-alt="A" data-gallery-caption="Alpha" data-pinterest-href="https://www.pinterest.com/pin/create/button/?media=a" data-pinterest-label="Save Alpha to Pinterest"></button>
			<button data-gallery-src="/b.webp" data-gallery-alt="B" data-gallery-caption="Beta" data-pinterest-href="https://www.pinterest.com/pin/create/button/?media=b" data-pinterest-label="Save Beta to Pinterest"></button>
			<article hidden><button data-gallery-src="/hidden.webp" data-gallery-alt="Hidden" data-gallery-caption="Hidden"></button></article>
		</div>
		<dialog id="dlg">
			<img data-gallery-image />
			<p data-gallery-caption></p>
			<span data-pinterest-widget></span>
			<button data-gallery-prev></button><button data-gallery-next></button><button data-gallery-close></button>
		</dialog>`;
	const dialog = document.getElementById('dlg') as HTMLDialogElement;
	dialog.showModal = () => dialog.setAttribute('open', '');
	dialog.close = () => dialog.removeAttribute('open');
	initGridGallery(document.getElementById('root') as HTMLElement, dialog);
	return { dialog, triggers: document.querySelectorAll<HTMLElement>('[data-gallery-src]') };
}

describe('initGridGallery', () => {
	beforeEach(() => { document.body.innerHTML = ''; });

	it('opens the dialog with the clicked image', () => {
		// Arrange
		const { dialog, triggers } = setup();

		// Act
		triggers[1].click();

		// Assert
		expect(dialog.open).toBe(true);
		expect(dialog.querySelector('img')?.getAttribute('src')).toBe('/b.webp');
	});

	it('wraps to the first image on next from the last', () => {
		// Arrange
		const { dialog, triggers } = setup();
		triggers[1].click();

		// Act
		dialog.querySelector<HTMLElement>('[data-gallery-next]')?.click();

		// Assert
		expect(dialog.querySelector('img')?.getAttribute('src')).toBe('/a.webp');
	});

	it('closes from the close button', () => {
		// Arrange
		const { dialog, triggers } = setup();
		triggers[0].click();

		// Act
		dialog.querySelector<HTMLElement>('[data-gallery-close]')?.click();

		// Assert
		expect(dialog.open).toBe(false);
	});

	it('updates the Pinterest target when navigating images', () => {
		// Arrange
		const { dialog, triggers } = setup();
		triggers[0].click();

		// Act
		dialog.querySelector<HTMLElement>('[data-gallery-next]')?.click();

		// Assert
		const link = dialog.querySelector<HTMLAnchorElement>('[data-pinterest-widget] a');
		expect(new URL(link?.href ?? '').searchParams.get('media')).toBe('b');
		expect(link?.getAttribute('aria-label')).toBe('Save Beta to Pinterest');
	});
});
