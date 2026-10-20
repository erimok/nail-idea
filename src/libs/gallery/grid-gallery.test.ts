// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { initGridGallery } from './grid-gallery';

function setup() {
	document.body.innerHTML = `
		<div id="root">
			<button data-gallery-src="/a.webp" data-gallery-alt="A" data-gallery-caption="Alpha"></button>
			<button data-gallery-src="/b.webp" data-gallery-alt="B" data-gallery-caption="Beta"></button>
		</div>
		<dialog id="dlg">
			<img data-gallery-image />
			<p data-gallery-caption></p>
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
});
