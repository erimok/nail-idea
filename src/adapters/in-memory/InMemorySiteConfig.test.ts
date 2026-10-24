import { describe, expect, it } from 'vitest';
import { InMemorySiteConfig } from './InMemorySiteConfig';

describe('InMemorySiteConfig', () => {
	it('uses the provided site URL', () => {
		// Arrange
		const siteConfig = new InMemorySiteConfig('https://example.com');

		// Act
		const result = siteConfig.siteUrl;

		// Assert
		expect(result).toBe('https://example.com');
	});

	it('defaults to the production site URL', () => {
		// Arrange
		const siteConfig = new InMemorySiteConfig();

		// Act
		const result = siteConfig.siteUrl;

		// Assert
		expect(result).toBe('https://nail-idea.com');
	});
});
