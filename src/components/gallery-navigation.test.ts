import { describe, expect, it } from 'vitest';
import { stepIndex } from './gallery-navigation';

describe('stepIndex', () => {
	it('advances to the next index', () => {
		// Arrange
		const index = 1;

		// Act
		const result = stepIndex(index, 1, 3);

		// Assert
		expect(result).toBe(2);
	});

	it('wraps from the last item to the first', () => {
		// Arrange
		const index = 2;

		// Act
		const result = stepIndex(index, 1, 3);

		// Assert
		expect(result).toBe(0);
	});

	it('wraps from the first item to the last when stepping back', () => {
		// Arrange
		const index = 0;

		// Act
		const result = stepIndex(index, -1, 3);

		// Assert
		expect(result).toBe(2);
	});

	it('returns 0 for an empty list', () => {
		// Arrange
		const length = 0;

		// Act
		const result = stepIndex(0, 1, length);

		// Assert
		expect(result).toBe(0);
	});
});
