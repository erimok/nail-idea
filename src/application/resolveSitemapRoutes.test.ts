import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { MIN_DESIGNS_FOR_INDEX } from '../domain/indexability';
import { aHub, aNail } from '../test/builders';
import { resolveSitemapRoutes } from './resolveSitemapRoutes';

describe('resolveSitemapRoutes', () => {
	it('excludes the empty pedicure area and hubs without editorial metadata', async () => {
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
		expect(result).toEqual(['/','/about/','/manicure/']);
	});

	it('includes area and hub routes that meet the six-design threshold with editorial copy', async () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
			slug: `red-${index + 1}`,
			colors: ['red'],
			typesOfNails: 'manicure',
		}));
		const ports = {
			nailRepository: new InMemoryNailRepository(nails),
			hubRepository: new InMemoryHubRepository([aHub({ area: 'manicure', urlSlug: 'red-nails' })]),
		};

		// Act
		const result = await resolveSitemapRoutes(ports);

		// Assert
		expect(result).toEqual(['/','/about/','/manicure/','/manicure/red-nails/']);
	});
});
