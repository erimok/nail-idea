import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { MIN_DESIGNS_FOR_INDEX } from '../domain/indexability';
import { aHub, aNail } from '../test/builders';
import { buildAreaPage } from './buildAreaPage';

function createPorts(nailCount: number) {
	const nails = Array.from({ length: nailCount }, (_, index) => aNail({
		slug: `manicure-${index + 1}`,
		title: `Manicure ${index + 1}`,
		image: `/images/nails/manicure-${index + 1}.jpg`,
		typesOfNails: index === nailCount - 1 ? 'both' : 'manicure',
		colors: ['red'],
		types: ['solid'],
		occasions: ['party'],
		finishes: ['glossy'],
		description: `Design ${index + 1}.`,
	}));
	const hubs = [
		aHub({ area: 'manicure', urlSlug: 'red-nails' }),
		aHub({ area: 'manicure', urlSlug: 'solid-nails' }),
		aHub({ area: 'manicure', urlSlug: 'party-nails' }),
		aHub({ area: 'manicure', urlSlug: 'glossy-nails' }),
		aHub({ area: 'manicure', urlSlug: 'red-solid-nails' }),
	];

	return {
		nailRepository: new InMemoryNailRepository(nails),
		hubRepository: new InMemoryHubRepository(hubs),
		siteContentRepository: new InMemorySiteContentRepository(),
		siteConfig: new InMemorySiteConfig(),
	};
}

describe('buildAreaPage', () => {
	it('omits nested links below the indexing threshold', async () => {
		// Arrange
		const ports = createPorts(MIN_DESIGNS_FOR_INDEX - 1);

		// Act
		const result = await buildAreaPage(ports, { area: 'manicure' });

		// Assert
		expect(result.layout.noIndex).toBe(true);
		expect(result.designs.map(({ slug }) => slug)).toEqual(
			Array.from({ length: MIN_DESIGNS_FOR_INDEX - 1 }, (_, index) => `manicure-${index + 1}`),
		);
		expect(result.sectionTitle).toBe('All manicure ideas');
		expect(result.relatedLinks).toBeUndefined();
	});

	it('marks area pages indexable at the configured design threshold', async () => {
		// Arrange
		const ports = createPorts(MIN_DESIGNS_FOR_INDEX);

		// Act
		const result = await buildAreaPage(ports, { area: 'manicure' });

		// Assert
		expect(result.layout.noIndex).toBe(false);
		expect(result.layout.canonical).toBe('https://nail.ai/manicure/');
		expect(result.layout.structuredData?.['@graph']).toContainEqual(expect.objectContaining({
			'@type': 'ImageGallery',
			'@id': 'https://nail.ai/manicure/#gallery',
			name: 'Manicure ideas',
			associatedMedia: expect.arrayContaining([
				expect.objectContaining({ contentUrl: 'https://nail.ai/images/nails/manicure-1.jpg' }),
			]),
		}));
		expect(result.relatedLinks?.title).toBe('You may like');
		expect(result.relatedLinks?.groups.find(({ label }) => label === 'Combinations')?.links).toContainEqual(
			{ label: 'Red Solid', href: '/manicure/red-solid-nails/' },
		);
	});
});
