import { describe, expect, it } from 'vitest';
import { buildPinterestUrl } from './pinterest';

describe('buildPinterestUrl', () => {
	it('preserves the source page, selected image and description with special characters', () => {
		// Arrange
		const input = {
			canonical: 'https://example.com/manicure/red-nails/',
			image: '/_astro/nail image.jpg',
			description: 'Red & pink café nails',
		};

		// Act
		const result = new URL(buildPinterestUrl(input));

		// Assert
		expect(result.origin + result.pathname).toBe('https://www.pinterest.com/pin/create/button/');
		expect(result.searchParams.get('url')).toBe(input.canonical);
		expect(result.searchParams.get('media')).toBe('https://example.com/_astro/nail%20image.jpg');
		expect(result.searchParams.get('description')).toBe(input.description);
		expect(result.search).not.toContain('+');
	});

	it('uses the originating page rather than another listing for the same image', () => {
		// Arrange
		const input = {
			canonical: 'https://example.com/manicure/short-nails/',
			image: '/nail.jpg',
			description: 'Short nails',
		};

		// Act
		const result = new URL(buildPinterestUrl(input));

		// Assert
		expect(result.searchParams.get('url')).toBe(input.canonical);
	});
});
