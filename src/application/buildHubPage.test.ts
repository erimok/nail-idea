import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { INITIAL_DESIGN_COUNT } from '../domain/gallery';
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
	it('keeps every design while splitting a large hub into initial and deferred cards', async () => {
		// Arrange
		const nails = Array.from({ length: INITIAL_DESIGN_COUNT + 2 }, (_, index) => aNail({
			slug: `red-${index + 1}`,
			colors: ['red'],
			types: ['solid'],
		}));
		const ports = createPorts(nails);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.designs).toEqual(nails);
		expect(result.designGrid?.initial).toEqual(nails.slice(0, INITIAL_DESIGN_COUNT));
		expect(result.designGrid?.remaining).toEqual(nails.slice(INITIAL_DESIGN_COUNT));
	});

	it('returns no deferred cards when the hub fits in the initial grid', async () => {
		// Arrange
		const nails = [aNail({ colors: ['red'], types: ['solid'] })];
		const ports = createPorts(nails);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.designGrid?.initial).toEqual(nails);
		expect(result.designGrid?.remaining).toEqual([]);
	});

	it('generates copy and stays noindex below the design threshold', async () => {
		// Arrange
		const ports = createPorts([aNail({ slug: 'red-1', colors: ['red'], types: ['solid'], finishes: ['glossy'] })]);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.noIndex).toBe(true);
		expect(result.heading).toBe('Red Nails: 1 Idea');
		expect(result.layout.title).toBe('Red Nail Ideas: 1 Design (2026) | nail-idea.com');
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

	it('points indexable hubs to their Markdown alternate', async () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, () => aNail({ colors: ['red'], types: ['solid'], finishes: ['glossy'] }));
		const ports = createPorts(nails);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.markdownAlternate).toBe(new URL('/manicure/red-nails.md', ports.siteConfig.siteUrl).toString());
	});

	it('omits the Markdown alternate for noindex hubs', async () => {
		// Arrange
		const ports = createPorts([aNail({ colors: ['red'], types: ['solid'], finishes: ['glossy'] })]);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.markdownAlternate).toBeUndefined();
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

	it('links from type hubs only to indexable subpages that retain the type facet', async () => {
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
		expect(links.map(({ href }) => href)).toContain('/manicure/burgundy-french-nails/');
		expect(links.map(({ href }) => href)).toContain('/manicure/short-french-nails/');
		expect(links.map(({ href }) => href)).toContain('/manicure/glossy-french-nails/');
		expect(links.map(({ href }) => href)).not.toContain('/manicure/burgundy-nails/');
		expect(links.map(({ href }) => href)).not.toContain('/manicure/oval-nails/');
		expect(links.map(({ href }) => href)).not.toContain('/manicure/spring-nails/');
		expect(links.map(({ href }) => href)).not.toContain('/manicure/blue-nails/');
		expect(links.map(({ href }) => href)).not.toContain('/manicure/square-nails/');
		expect(result.relatedLinks?.groups.map(({ label }) => label)).toEqual([
			'Colors',
			'Shapes',
			'Lengths',
			'Finishes',
		]);
		expect(links.map(({ label }) => label)).toContain('Burgundy French');

		const introLinks = result.intro?.flatMap(({ href }) => href ? [href] : []) ?? [];
		expect(introLinks.length).toBeGreaterThan(0);
		expect(introLinks.every((href) => href.includes('french'))).toBe(true);
	});

	it('links from non-type single-facet hubs only to combinations that include the facet', async () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
			slug: `medium-${index + 1}`,
			colors: ['burgundy'],
			types: ['french'],
			length: 'medium',
		}));
		const ports = createPorts(nails);

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'medium-nails' });

		// Assert
		const links = result.relatedLinks?.groups.flatMap(({ links: groupLinks }) => groupLinks) ?? [];
		expect(links.length).toBeGreaterThan(0);
		expect(links.every(({ href }) => href.includes('medium'))).toBe(true);
	});

	describe('core style parent link', () => {
		function glitterFrenchNails(count: number) {
			return Array.from({ length: count }, (_, index) => aNail({
				slug: `glitter-french-${index + 1}`,
				types: ['french'],
				finishes: ['glitter'],
			}));
		}

		it('links combination hubs to their indexable core style hub', async () => {
			// Arrange
			const ports = createPorts(glitterFrenchNails(MIN_DESIGNS_FOR_INDEX));

			// Act
			const result = await buildHubPage(ports, { area: 'manicure', slug: 'glitter-french-nails' });

			// Assert
			expect(result.coreStyleLink).toEqual({
				label: 'French tip nails',
				href: '/manicure/french-nails/',
				designCount: MIN_DESIGNS_FOR_INDEX,
			});
		});

		it('adds the core style hub to the breadcrumbs', async () => {
			// Arrange
			const ports = createPorts(glitterFrenchNails(MIN_DESIGNS_FOR_INDEX));

			// Act
			const result = await buildHubPage(ports, { area: 'manicure', slug: 'glitter-french-nails' });

			// Assert
			expect(result.breadcrumbs.map(({ href }) => href)).toEqual(['/', '/manicure/', '/manicure/french-nails/', undefined]);
		});

		it('does not link the core style hub itself', async () => {
			// Arrange
			const ports = createPorts(glitterFrenchNails(MIN_DESIGNS_FOR_INDEX));

			// Act
			const result = await buildHubPage(ports, { area: 'manicure', slug: 'french-nails' });

			// Assert
			expect(result.coreStyleLink).toBeUndefined();
		});

		it('omits the link when the core style hub is below the indexing threshold', async () => {
			// Arrange
			const glitter = glitterFrenchNails(MIN_DESIGNS_FOR_INDEX - 1);
			const ports = createPorts(glitter);

			// Act
			const result = await buildHubPage(ports, { area: 'manicure', slug: 'glitter-french-nails' });

			// Assert
			expect(result.coreStyleLink).toBeUndefined();
		});
	});

	it('sets a large social image from the canonical origin', async () => {
		// Arrange
		const ports = createPorts();

		// Act
		const result = await buildHubPage(ports, { area: 'manicure', slug: 'red-nails' });

		// Assert
		expect(result.layout.socialImage).toBe(new URL('/og/home.jpg', ports.siteConfig.siteUrl).toString());
	});
});
