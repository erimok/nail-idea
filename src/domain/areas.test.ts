import { describe, expect, it } from 'vitest';
import { isNailArea, nailAreas } from './areas';

describe('domain areas', () => {
	it('defines the supported nail areas', () => {
		// Arrange
		const expectedAreas = ['manicure', 'pedicure'];

		// Act
		const result = [...nailAreas];

		// Assert
		expect(result).toEqual(expectedAreas);
	});

	it('accepts only known areas', () => {
		// Arrange
		const knownArea = 'manicure';
		const unknownArea = 'nail-art';

		// Act
		const result = [isNailArea(knownArea), isNailArea(unknownArea)];

		// Assert
		expect(result).toEqual([true, false]);
	});
});
