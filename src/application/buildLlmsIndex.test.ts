import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { aNail } from '../test/builders';
import { buildLlmsIndex } from './buildLlmsIndex';

describe('buildLlmsIndex', () => {
	it('includes only indexable hubs with canonical Markdown URLs', async () => {
		// Arrange
		const nails = [
			...Array.from({ length: 6 }, (_, index) => aNail({
				slug: `red-${index + 1}`,
				colors: ['red'],
				types: ['solid'],
			})),
			aNail({ slug: 'blue-1', colors: ['blue'] }),
		];
		const ports = {
			nailRepository: new InMemoryNailRepository(nails),
			hubRepository: new InMemoryHubRepository([]),
			siteContentRepository: new InMemorySiteContentRepository(),
			siteConfig: new InMemorySiteConfig(),
		};

		// Act
		const result = await buildLlmsIndex(ports);

		// Assert
		expect(result.areas).toHaveLength(1);
		expect(result.areas[0].area).toBe('manicure');
		expect(result.areas[0].pages).toContainEqual({
			title: 'Red Nails: 6 Ideas',
			description: 'Browse 6 red manicure ideas: solid looks. Save your favorites on nail-idea.com.',
			markdownUrl: 'https://nail-idea.com/manicure/red-nails.md',
		});
		expect(result.areas[0].pages.every(({ markdownUrl }) => !markdownUrl.includes('blue-nails'))).toBe(true);
	});
});
