import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryFaqRepository } from '../adapters/in-memory/InMemoryFaqRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { INITIAL_DESIGN_COUNT, SHOW_MORE_BATCH_SIZE } from '../domain/gallery';
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
		faqRepository: new InMemoryFaqRepository(),
		siteContentRepository: new InMemorySiteContentRepository(),
		siteConfig: new InMemorySiteConfig(),
	};
}

describe('buildAreaPage', () => {
	it('adds manicure guidance below the gallery', async () => {
		// Arrange
		const ports = createPorts(MIN_DESIGNS_FOR_INDEX);

		// Act
		const result = await buildAreaPage(ports, { area: 'manicure' });

		// Assert
		expect(result.editorialSections).toEqual([
			{
				heading: 'How to choose a manicure design',
				body: 'Start with the detail you care about most: nail shape, length, color, or finish. Then decide how much decoration you want. A solid shade keeps the focus on color, while French tips and nail art add contrast or detail. If you are comparing options, look at designs with a similar shape or length first to see how a change in color or finish affects the overall look.',
			},
			{
				heading: 'Browse manicure ideas by color, shape, and occasion',
				body: 'Use the search to narrow the collection by color, shape, finish, or occasion, or browse the full gallery for ideas. Compare how different shades and finishes look, and whether a design keeps every nail simple or adds detail to selected nails. When you find a reference you like, note the elements that stand out so you can explain what you want to your nail technician.',
			},
		]);
	});

	it('splits a large area gallery into initial and deferred designs', async () => {
		// Arrange
		const ports = createPorts(INITIAL_DESIGN_COUNT + 2);

		// Act
		const result = await buildAreaPage(ports, { area: 'manicure' });

		// Assert
		expect(result.designGrid?.initial).toEqual(result.designs.slice(0, INITIAL_DESIGN_COUNT));
		expect(result.designGrid?.remaining).toEqual(result.designs.slice(INITIAL_DESIGN_COUNT));
		expect(result.designGrid?.batchSize).toBe(SHOW_MORE_BATCH_SIZE);
	});

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
		expect(result.layout.canonical).toBe('https://nail-idea.com/manicure/');
		expect(result.layout.structuredData?.['@graph']).toContainEqual(expect.objectContaining({
			'@type': 'ImageGallery',
			'@id': 'https://nail-idea.com/manicure/#gallery',
			name: 'Manicure ideas',
			associatedMedia: expect.arrayContaining([
				expect.objectContaining({ contentUrl: 'https://nail-idea.com/images/nails/manicure-1.jpg' }),
			]),
		}));
		expect(result.relatedLinks?.title).toBe('You may like');
		expect(result.relatedLinks?.groups.map(({ label }) => label)).not.toContain('Combinations');
		expect(result.relatedLinks?.groups.map(({ label }) => label)).not.toContain('Shapes');
	});
});
