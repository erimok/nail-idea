import { describe, expect, it } from 'vitest';
import { EnvSiteConfig } from './EnvSiteConfig';

describe('EnvSiteConfig', () => {
	it('uses the configured site URL', () => {
		// Arrange
		const siteConfig = new EnvSiteConfig({ SITE_URL: 'https://example.com' });

		// Act
		const result = siteConfig.siteUrl;

		// Assert
		expect(result).toBe('https://example.com');
	});

	it('defaults to the production site URL', () => {
		// Arrange
		const siteConfig = new EnvSiteConfig({});

		// Act
		const result = siteConfig.siteUrl;

		// Assert
		expect(result).toBe('https://nail-idea.com');
	});

	it('rejects invalid site URLs', () => {
		// Arrange
		const createSiteConfig = () => new EnvSiteConfig({ SITE_URL: 'not-a-url' });

		// Act
		const result = createSiteConfig;

		// Assert
		expect(result).toThrow(/SITE_URL/i);
	});
});
