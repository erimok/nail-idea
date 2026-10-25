// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { initShowMore } from './show-more';

function setup(batchSize: number, remainingCount: number) {
	document.body.innerHTML = `
		<div id="grid">
			<article><button data-gallery-src="/initial.webp"></button></article>
			${Array.from({ length: remainingCount }, (_, index) => `
				<article data-gallery-deferred hidden>
					<button data-gallery-src="/deferred-${index + 1}.webp"></button>
				</article>`).join('')}
		</div>
		<p id="status" aria-live="polite"></p>
		<button id="show-more" data-batch-size="${batchSize}" data-total-count="${remainingCount + 1}">Show more designs</button>`;
	const grid = document.getElementById('grid') as HTMLElement;
	const button = document.getElementById('show-more') as HTMLButtonElement;
	const status = document.getElementById('status') as HTMLElement;
	initShowMore(grid, button, status);
	return { grid, button, status };
}

describe('initShowMore', () => {
	beforeEach(() => { document.body.innerHTML = ''; });

	it('reveals one batch and updates the live count', () => {
		// Arrange
		const { grid, button, status } = setup(2, 3);

		// Act
		button.click();

		// Assert
		expect(grid.querySelectorAll('[data-gallery-deferred][hidden]')).toHaveLength(1);
		expect(status.textContent).toBe('Showing 3 of 4 designs');
	});

	it('removes the button and announces completion after the last batch', () => {
		// Arrange
		const { grid, button, status } = setup(2, 3);

		// Act
		button.click();
		button.click();

		// Assert
		expect(grid.querySelectorAll('[data-gallery-deferred][hidden]')).toHaveLength(0);
		expect(document.querySelector('[data-show-more]')).toBeNull();
		expect(status.textContent).toBe('All 4 designs shown');
	});

	it('moves focus to the first newly revealed design', () => {
		// Arrange
		const { grid, button } = setup(2, 3);
		const firstRevealedButton = grid.querySelector<HTMLButtonElement>('[data-gallery-deferred] [data-gallery-src]');

		// Act
		button.click();

		// Assert
		expect(document.activeElement).toBe(firstRevealedButton);
	});
});
