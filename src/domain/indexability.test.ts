import { describe, expect, it } from 'vitest';
import { aHub } from '../test/builders';
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

	it('requires editorial metadata for hubs', () => {
		// Arrange
		const editorial = aHub({ intro: 'Curated intro.', metaDescription: 'Curated description.' });

		// Act
		const result = [
			isIndexable({ nails: Array(MIN_DESIGNS_FOR_INDEX), editorial }),
			isIndexable({ nails: Array(MIN_DESIGNS_FOR_INDEX) }),
			isIndexable({ nails: Array(MIN_DESIGNS_FOR_INDEX - 1), editorial }),
		];

		// Assert
		expect(result).toEqual([true, false, false]);
	});
});
