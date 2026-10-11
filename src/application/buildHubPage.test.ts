import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { MIN_DESIGNS_FOR_INDEX } from '../domain/indexability';
import type { HubEditorial } from '../domain/hub-types';
import type { NailRecord } from '../domain/nail';
import { aHub, aNail } from '../test/builders';
import { buildHubPage } from './buildHubPage';

function createPorts(
	nails: readonly NailRecord[] = [aNail({ colors: ['red'], types: ['solid'], finishes: ['glossy'], occasions: ['party'] })],
	hubs: readonly HubEditorial[] = [],
) {
	return {
		nailRepository: new InMemoryNailRepository(nails),
		hubRepository: new InMemoryHubRepository(hubs),
		siteConfig: new InMemorySiteConfig(),
	};
}

describe('buildHubPage', () => {
	it('falls back to generated copy and noindex when editorial is missing', async () => {
		// Arrange
		const ports = createPorts([
			aNail({
				slug: 'red-1',
				colors: ['red'],
				types: ['solid'],
				finishes: ['glossy'],
				occasions: ['party'],
				description: 'A glossy red manicure.',
			}),
		]);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.noIndex).toBe(true);
		expect(result.layout.description).toBe('Explore 1 red manicure design organized around red.');
		expect(result.paragraphs).toEqual([
			'Browse 1 red manicure design in the Nail.ai collection. Use the search above to add another detail and compare matching looks.',
		]);
	});

	it('keeps curated hubs indexable at six designs', async () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
			slug: `red-${index + 1}`,
			colors: ['red'],
			types: ['solid'],
			finishes: ['glossy'],
			occasions: ['party'],
		}));
		const hubs = [aHub({
			area: 'manicure',
			urlSlug: 'red-nails',
			intro: 'Curated red intro.',
			metaDescription: 'Curated red description.',
			faq: [{ question: 'Is red timeless?', answer: 'Red is a classic.' }],
		})];
		const ports = createPorts(nails, hubs);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.noIndex).toBe(false);
		expect(result.layout.description).toBe('Curated red description.');
		expect(result.faq).toEqual([{ question: 'Is red timeless?', answer: 'Red is a classic.' }]);
	});
});
