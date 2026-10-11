import { describe, expect, it } from 'vitest';
import { createCombinationSlugCollisionError, createFacetSlugCollisionError, SlugCollisionError } from './slug-collision';

describe('domain slug collisions', () => {
	it('creates a typed facet collision error', () => {
		// Arrange
		const area = 'manicure';
		const slug = 'french-nails';

		// Act
		const result = createFacetSlugCollisionError(area, slug, 'color "french"', 'type "french"');

		// Assert
		expect(result).toBeInstanceOf(SlugCollisionError);
		expect(result.message).toBe('Facet URL conflict for /manicure/french-nails/: color "french" and type "french".');
	});

	it('creates a typed combination collision error', () => {
		// Arrange
		const area = 'manicure';
		const slug = 'short-nude-nails';

		// Act
		const result = createCombinationSlugCollisionError(area, slug);

		// Assert
		expect(result).toBeInstanceOf(SlugCollisionError);
		expect(result.message).toBe('Facet URL conflict for /manicure/short-nude-nails/: multiple facet combinations normalize to the same slug.');
	});
});
