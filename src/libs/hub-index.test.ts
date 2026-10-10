import { describe, expect, it } from 'vitest';
import { isIndexable, MIN_INDEXABLE } from './hub-index';

describe('hub indexability', () => {
	it('requires the minimum design count and editorial metadata', () => {
		expect(MIN_INDEXABLE).toBe(6);
		expect(isIndexable({ nails: Array(6) })).toBe(false);
		expect(isIndexable({
			nails: Array(5),
			editorial: { intro: 'Curated intro.', metaDescription: 'Curated metadata.' },
		})).toBe(false);
		expect(isIndexable({
			nails: Array(6),
			editorial: { intro: 'Curated intro.', metaDescription: 'Curated metadata.' },
		})).toBe(true);
	});
});