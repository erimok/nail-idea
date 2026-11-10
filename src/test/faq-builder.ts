import type { FaqRecord } from '../domain/faq';

export function aFaq(overrides: Partial<FaqRecord> = {}): FaqRecord {
	return {
		slug: 'red-care',
		question: 'How do I choose red nails?',
		summary: 'Compare shades.',
		fullAnswer: 'Compare shades with a reference image.',
		metaDescription: 'Explore how to choose red shades.',
		status: 'published',
		areas: ['manicure'],
		facets: [{ kind: 'color', value: 'red' }],
		hubs: [],
		homepage: false,
		order: 1,
		...overrides,
	};
}
