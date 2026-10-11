import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { MIN_DESIGNS_FOR_INDEX } from '../domain/indexability';
import { aNail } from '../test/builders';
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
			hubRepository: new InMemoryHubRepository([]),
		};

		// Act
		const result = await resolveSitemapRoutes(ports);

		// Assert
		expect(result).toEqual(['/','/about/','/manicure/','/manicure/red-nails/']);
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
		expect(result).toEqual(['/','/about/']);
	});
});
