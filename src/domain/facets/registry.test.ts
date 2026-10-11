import { describe, expect, it } from 'vitest';
import { aNail } from '../../test/builders';
import { combinableFacetKinds, facetRegistry, getFacetValues } from './registry';

describe('domain facet registry', () => {
	it('tracks which facets can form combinations', () => {
		// Arrange
		const expectedRegistry = [
			{ name: 'color', combinable: true },
			{ name: 'type', combinable: true },
			{ name: 'occasion', combinable: false },
			{ name: 'season', combinable: false },
			{ name: 'shape', combinable: true },
			{ name: 'length', combinable: true },
			{ name: 'finishing', combinable: true },
		];

		// Act
		const result = { registry: facetRegistry, combinable: combinableFacetKinds };

		// Assert
		expect(result).toEqual({
			registry: expectedRegistry,
			combinable: ['length', 'finishing', 'color', 'type', 'shape'],
		});
	});

	it('returns empty values for missing optional facets', () => {
		// Arrange
		const nail = aNail({ season: undefined, shape: undefined, length: undefined });

		// Act
		const result = {
			season: getFacetValues(nail, 'season'),
			shape: getFacetValues(nail, 'shape'),
			length: getFacetValues(nail, 'length'),
		};

		// Assert
		expect(result).toEqual({
			season: [],
			shape: [],
			length: [],
		});
	});
});
