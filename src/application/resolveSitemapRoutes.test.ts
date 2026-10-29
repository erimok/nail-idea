import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { MIN_DESIGNS_FOR_INDEX } from '../domain/indexability';
import { aHub, aNail } from '../test/builders';
import { resolveSitemapRoutes } from './resolveSitemapRoutes';

describe('resolveSitemapRoutes', () => {
	it('excludes the empty pedicure area', async () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
			slug: `red-${index + 1}`,
			colors: ['red'],
			typesOfNails: 'manicure',
		}));
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
		const result = await resolveSitemapRoutes(ports);

		// Assert
		expect(result.map(({ url }) => url)).toEqual([
			'/', '/about/', '/terms/', '/privacy-policy/', '/manicure/', '/manicure/red-nails/',
		]);
	});

	it('excludes hubs below the six-design threshold', async () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX - 1 }, (_, index) => aNail({
			slug: `red-${index + 1}`,
			colors: ['red'],
			typesOfNails: 'manicure',
		}));
		const ports = {
			nailRepository: new InMemoryNailRepository(nails),
			hubRepository: new InMemoryHubRepository([]),
		};

		// Act
		const result = await resolveSitemapRoutes(ports);

		// Assert
		expect(result.map(({ url }) => url)).toEqual(['/', '/about/', '/terms/', '/privacy-policy/']);
	});

	it('uses the latest contributing content timestamp for each route', async () => {
		// Arrange
		const nails = Array.from({ length: 12 }, (_, index) => aNail({
			slug: `nail-${index + 1}`,
			colors: [index < 6 ? 'red' : 'blue'],
			updatedAt: `2026-10-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`,
			typesOfNails: 'manicure',
		}));
		const ports = {
			nailRepository: new InMemoryNailRepository(nails),
			hubRepository: new InMemoryHubRepository([aHub({
				urlSlug: 'red-nails',
				updatedAt: '2026-10-20T12:00:00.000Z',
				intro: 'A curated introduction.',
				metaDescription: 'A curated description.',
			})]),
		};

		// Act
		const result = await resolveSitemapRoutes(ports);

		// Assert
		expect(result.find(({ url }) => url === '/')?.lastmod).toBe('2026-10-12');
		expect(result.find(({ url }) => url === '/manicure/')?.lastmod).toBe('2026-10-12');
		expect(result.find(({ url }) => url === '/manicure/red-nails/')?.lastmod).toBe('2026-10-20');
		expect(result.find(({ url }) => url === '/about/')).toEqual({ url: '/about/' });
		expect(result.find(({ url }) => url === '/terms/')).toEqual({ url: '/terms/' });
		expect(result.find(({ url }) => url === '/privacy-policy/')).toEqual({ url: '/privacy-policy/' });
	});
});
