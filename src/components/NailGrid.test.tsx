// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import NailGrid from './NailGrid';
import type { NailSearchRecord } from '../libs/ai/nail-search';

afterEach(cleanup);

function aNail(slug: string): NailSearchRecord {
	return {
		slug,
		title: `Nail ${slug}`,
		description: `Description ${slug}`,
		imageSrc: `/${slug}.jpg`,
		imageAlt: `Alt ${slug}`,
	} as NailSearchRecord;
}

describe('NailGrid gallery', () => {
	it('opens the clicked image in the gallery', async () => {
		// Arrange
		const user = userEvent.setup();
		render(<NailGrid items={[{ nail: aNail('a') }, { nail: aNail('b') }]} />);

		// Act
		await user.click(screen.getByRole('button', { name: 'View full image: Nail b' }));

		// Assert
		const dialog = screen.getByRole('dialog', { hidden: true });
		expect(dialog.querySelector('img')?.getAttribute('src')).toBe('/b.jpg');
	});

	it('moves to the next image', async () => {
		// Arrange
		const user = userEvent.setup();
		render(<NailGrid items={[{ nail: aNail('a') }, { nail: aNail('b') }]} />);
		await user.click(screen.getByRole('button', { name: 'View full image: Nail a' }));

		// Act
		await user.click(screen.getByRole('button', { name: 'Next image', hidden: true }));

		// Assert
		expect(screen.getByRole('dialog', { hidden: true }).querySelector('img')?.getAttribute('src')).toBe('/b.jpg');
	});

	it('closes the gallery', async () => {
		// Arrange
		const user = userEvent.setup();
		render(<NailGrid items={[{ nail: aNail('a') }]} />);
		await user.click(screen.getByRole('button', { name: 'View full image: Nail a' }));

		// Act
		await user.click(screen.getByRole('button', { name: 'Close gallery', hidden: true }));

		// Assert
		expect(screen.getByRole('dialog', { hidden: true }).querySelector('img')).toBeNull();
	});

	it('updates the Pinterest target when the lightbox image changes', async () => {
		// Arrange
		const user = userEvent.setup();
		render(<NailGrid canonical="https://example.com/manicure/red-nails/" items={[{ nail: aNail('a') }, { nail: aNail('b') }]} />);
		await user.click(screen.getByRole('button', { name: 'View full image: Nail a' }));

		// Act
		await user.click(screen.getByRole('button', { name: 'Next image', hidden: true }));

		// Assert
		const dialog = screen.getByRole('dialog', { hidden: true });
		const link = dialog.querySelector<HTMLAnchorElement>('[data-pinterest-widget] a');
		const url = new URL(link?.href ?? '');
		expect(url.searchParams.get('media')).toBe('https://example.com/b.jpg');
		expect(url.searchParams.get('url')).toBe('https://example.com/manicure/red-nails/');
		expect(link?.getAttribute('aria-label')).toBe('Save Nail b to Pinterest');
	});
});
