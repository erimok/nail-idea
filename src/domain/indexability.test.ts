import { describe, expect, it } from 'vitest';
import { isIndexable, isIndexablePage, MIN_DESIGNS_FOR_INDEX } from './indexability';

describe('domain indexability', () => {
	it('uses one threshold for page and hub indexability', () => {
		// Arrange
		const designCounts = [MIN_DESIGNS_FOR_INDEX - 1, MIN_DESIGNS_FOR_INDEX];

		// Act
		const result = designCounts.map((count) => isIndexablePage(count));

		// Assert
		expect(MIN_DESIGNS_FOR_INDEX).toBe(6);
		expect(result).toEqual([false, true]);
	});

	it('makes hubs indexable from design count alone', () => {
		// Arrange
		const hubs = [{ nails: Array(MIN_DESIGNS_FOR_INDEX) }, { nails: Array(MIN_DESIGNS_FOR_INDEX - 1) }];

		// Act
		const result = hubs.map(isIndexable);

		// Assert
		expect(result).toEqual([true, false]);
	});
});
