import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
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
		siteContentRepository: new InMemorySiteContentRepository(),
		siteConfig: new InMemorySiteConfig(),
	};
}

describe('buildHubPage', () => {
	it('generates copy and stays noindex below the design threshold', async () => {
		// Arrange
		const ports = createPorts([aNail({ slug: 'red-1', colors: ['red'], types: ['solid'], finishes: ['glossy'] })]);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.noIndex).toBe(true);
		expect(result.heading).toBe('Red manicure ideas');
		expect(result.layout.title).toMatch(/^Red Nail Designs/);
		expect(result.intro?.length).toBeGreaterThan(0);
	});

	it('makes hubs indexable at six designs using generated copy only', async () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, () => aNail({ colors: ['red'], types: ['solid'], finishes: ['glossy'] }));
		const ports = createPorts(nails);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.noIndex).toBe(false);
	});

	it('lets curated hubs override generated copy', async () => {
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
		expect(result.intro).toEqual([{ text: 'Curated red intro.' }]);
		expect(result.layout.description).toBe('Curated red description.');
		expect(result.faq).toEqual([{ question: 'Is red timeless?', answer: 'Red is a classic.' }]);
	});

	it('links only to indexable facet hubs that share designs with the current hub', async () => {
		// Arrange
		const frenchNails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
			slug: `french-${index + 1}`,
			colors: ['burgundy'],
			types: ['french'],
			finishes: ['glossy'],
			length: 'short',
			shape: 'oval',
			season: ['spring'],
		}));
		const unrelatedNails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
			slug: `solid-${index + 1}`,
			colors: ['blue'],
			types: ['solid'],
			finishes: ['matte'],
			length: 'long',
			shape: 'square',
			season: ['winter'],
		}));
		const ports = createPorts([...frenchNails, ...unrelatedNails]);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'french-nails' });

		// Assert
		const links = result.relatedLinks?.groups.flatMap(({ links: groupLinks }) => groupLinks) ?? [];
		expect(links.map(({ href }) => href)).toContain('/manicure/burgundy-nails/');
		expect(links.map(({ href }) => href)).toContain('/manicure/oval-nails/');
		expect(links.map(({ href }) => href)).toContain('/manicure/spring-nails/');
		expect(links.map(({ href }) => href)).not.toContain('/manicure/blue-nails/');
		expect(links.map(({ href }) => href)).not.toContain('/manicure/square-nails/');
	});
});
