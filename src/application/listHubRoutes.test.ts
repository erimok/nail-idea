import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { aHub, aNail } from '../test/builders';
import { listHubRoutes } from './listHubRoutes';

describe('listHubRoutes', () => {
	it('includes area routes and routes for both-area records in both areas', async () => {
		// Arrange
		const ports = {
			nailRepository: new InMemoryNailRepository([
				aNail({ slug: 'shared', colors: ['red'], typesOfNails: 'both' }),
			]),
			hubRepository: new InMemoryHubRepository([]),
		};

		// Act
		const result = await listHubRoutes(ports);

		// Assert
		expect(result.areaRoutes).toEqual([{ area: 'manicure' }, { area: 'pedicure' }]);
		expect(result.hubRoutes).toEqual(
			expect.arrayContaining([
				{ area: 'manicure', slug: 'red-nails' },
				{ area: 'pedicure', slug: 'red-nails' },
			]),
		);
	});

	it('lists only indexable hubs for Markdown routes', async () => {
		// Arrange
		const nails = [
			...Array.from({ length: 6 }, (_, index) => aNail({
				slug: `red-${index + 1}`,
				colors: ['red'],
				types: ['solid'],
			})),
			aNail({ slug: 'blue-1', colors: ['blue'], types: ['solid'] }),
		];
		const ports = {
			nailRepository: new InMemoryNailRepository(nails),
			hubRepository: new InMemoryHubRepository([aHub({
				area: 'manicure',
				urlSlug: 'red-nails',
				intro: 'A curated introduction.',
				metaDescription: 'A curated description.',
			})]),
		};

		// Act
		const result = await listHubRoutes(ports);

		// Assert
		expect(result.indexableHubRoutes).toContainEqual({ area: 'manicure', slug: 'red-nails' });
		expect(result.indexableHubRoutes).not.toContainEqual({ area: 'manicure', slug: 'blue-nails' });
	});

	it('propagates duplicate slug errors from the domain route generator', async () => {
		// Arrange
		const ports = {
			nailRepository: new InMemoryNailRepository([
				aNail({ colors: ['french'], types: ['french'] }),
			]),
			hubRepository: new InMemoryHubRepository([]),
		};

		// Act
		const result = listHubRoutes(ports);

		// Assert
		await expect(result).rejects.toThrow('Facet URL conflict for /manicure/french-nails/: color "french" and type "french".');
	});
});
