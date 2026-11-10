import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryFaqRepository } from '../adapters/in-memory/InMemoryFaqRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { buildStaticPage } from './buildStaticPage';

describe('buildStaticPage', () => {
	it('builds static page layout metadata with the configured canonical URL', async () => {
		// Arrange
		const ports = {
			nailRepository: new InMemoryNailRepository([]),
			hubRepository: new InMemoryHubRepository([]),
			siteContentRepository: new InMemorySiteContentRepository(),
			faqRepository: new InMemoryFaqRepository(),
			siteConfig: new InMemorySiteConfig('https://example.com'),
		};
		const page = {
			title: 'Terms of Use | nail-idea.com',
			description: 'Review the terms that apply when using nail-idea.com.',
			pathname: '/terms/',
		};

		// Act
		const result = await buildStaticPage(ports, page);

		// Assert
		expect(result.layout).toMatchObject({
			title: page.title,
			description: page.description,
			canonical: 'https://example.com/terms/',
			siteChrome: {
				faqIndexHref: '/faq/',
				header: { browseGroups: [], availableAreas: [] },
				footer: { groups: [] },
			},
		});
	});
});
