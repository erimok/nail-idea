import { describe, expect, it } from 'vitest';
import { matchesFaqHub, type FaqRecord } from './faq';

const faq: FaqRecord = {
	slug: 'example',
	question: 'Question?',
	summary: 'Summary.',
	fullAnswer: 'Full answer.',
	metaDescription: 'Description.',
	status: 'published',
	areas: ['manicure'],
	facets: [{ kind: 'color', value: 'red' }, { kind: 'type', value: 'french' }],
	hubs: [],
	homepage: false,
	order: 1,
};

describe('matchesFaqHub', () => {
	it('matches any assigned facet on a combination in the selected area', () => {
		// Arrange
		const page = { area: 'manicure' as const, slug: 'short-french-nails', facets: [{ kind: 'type' as const, value: 'french' }, { kind: 'length' as const, value: 'short' }] };

		// Act
		const result = matchesFaqHub(faq, page);

		// Assert
		expect(result).toBe(true);
	});

	it('does not inherit across areas', () => {
		// Arrange
		const page = { area: 'pedicure' as const, slug: 'red-nails', facets: [{ kind: 'color' as const, value: 'red' }] };

		// Act
		const result = matchesFaqHub(faq, page);

		// Assert
		expect(result).toBe(false);
	});

	it('matches an explicitly selected hub without facet assignments', () => {
		// Arrange
		const entry: FaqRecord = { ...faq, facets: [], hubs: [{ area: 'pedicure', slug: 'red-nails' }] };
		const page = { area: 'pedicure' as const, slug: 'red-nails', facets: [] };

		// Act
		const result = matchesFaqHub(entry, page);

		// Assert
		expect(result).toBe(true);
	});

	it('does not expose drafts', () => {
		// Arrange
		const entry: FaqRecord = { ...faq, status: 'draft' };
		const page = { area: 'manicure' as const, slug: 'red-nails', facets: [{ kind: 'color' as const, value: 'red' }] };

		// Act
		const result = matchesFaqHub(entry, page);

		// Assert
		expect(result).toBe(false);
	});
});
