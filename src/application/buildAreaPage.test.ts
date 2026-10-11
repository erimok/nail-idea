import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { aHub, aNail } from '../test/builders';
import { buildAreaPage } from './buildAreaPage';

function createPorts(nailCount: number) {
	const nails = Array.from({ length: nailCount }, (_, index) => aNail({
		slug: `manicure-${index + 1}`,
		title: `Manicure ${index + 1}`,
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
	];

	return {
		nailRepository: new InMemoryNailRepository(nails),
		hubRepository: new InMemoryHubRepository(hubs),
		siteConfig: new InMemorySiteConfig(),
	};
}

describe('buildAreaPage', () => {
	it('marks area pages noindex below six designs and includes both-area records', async () => {
		// Arrange
		const ports = createPorts(5);

		// Act
		const result = await buildAreaPage(ports, { area: 'manicure' });

		// Assert
		expect(result.layout.noIndex).toBe(true);
		expect(result.designs.map(({ slug }) => slug)).toEqual([
			'manicure-1',
			'manicure-2',
			'manicure-3',
			'manicure-4',
			'manicure-5',
		]);
		expect(result.sectionTitle).toBe('All manicure ideas');
	});

	it('marks area pages indexable at six designs', async () => {
		// Arrange
		const ports = createPorts(6);

		// Act
		const result = await buildAreaPage(ports, { area: 'manicure' });

		// Assert
		expect(result.layout.noIndex).toBe(false);
		expect(result.layout.canonical).toBe('https://nail.ai/manicure/');
		expect(result.relatedLinks?.title).toBe('Explore more manicure ideas');
	});
});
