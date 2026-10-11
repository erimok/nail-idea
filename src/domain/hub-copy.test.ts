import { describe, expect, it } from 'vitest';
import { aHub, aNail } from '../test/builders';
import { getAllFacetPages } from './facet-combinations';
import {
	countIntroWords,
	generateHubCopy,
	MAX_DESCRIPTION_LENGTH,
	MAX_INTRO_LINKS,
	MAX_INTRO_WORDS,
	MAX_TITLE_LENGTH,
	MIN_INTRO_WORDS,
	rankRelatedHubs,
	topSubfacets,
} from './hub-copy';
import { MIN_DESIGNS_FOR_INDEX, isIndexable } from './indexability';

function burgundyNails(count = MIN_DESIGNS_FOR_INDEX) {
	return Array.from({ length: count }, (_, index) => aNail({
		colors: ['burgundy'],
		types: index % 2 === 0 ? ['french'] : ['solid'],
		finishes: ['matte'],
		length: 'short',
		shape: index < 2 ? 'oval' : 'almond',
		occasions: ['party'],
	}));
}

function pageFor(nails: ReturnType<typeof burgundyNails>, slug: string) {
	const pages = getAllFacetPages(nails);
	const page = pages.find((candidate) => candidate.slug === slug);
	if (!page) throw new Error(`missing ${slug}`);
	return { page, pages };
}

describe('topSubfacets', () => {
	it('returns the most common values from other facet kinds, most frequent first', () => {
		// Arrange
		const { page } = pageFor(burgundyNails(), 'burgundy-nails');

		// Act
		const result = topSubfacets(page);

		// Assert
		expect(result).toEqual(['matte', 'party', 'short']);
	});

	it('excludes values of the page own facet kinds', () => {
		// Arrange
		const nails = [aNail({ colors: ['burgundy', 'blue'], finishes: ['matte'] })];
		const { page } = pageFor(nails, 'burgundy-nails');

		// Act
		const result = topSubfacets(page);

		// Assert
		expect(result).not.toContain('blue');
	});
});

describe('rankRelatedHubs', () => {
	it('excludes the current hub and caps the result', () => {
		// Arrange
		const { page, pages } = pageFor(burgundyNails(), 'burgundy-nails');
		const subfacets = topSubfacets(page);

		// Act
		const result = rankRelatedHubs(page, subfacets, pages);

		// Assert
		expect(result.length).toBeLessThanOrEqual(MAX_INTRO_LINKS);
		expect(result.map((hub) => hub.slug)).not.toContain('burgundy-nails');
	});
});

describe('generateHubCopy', () => {
	it('keeps the title within the limit and differs from the heading', () => {
		// Arrange
		const nails = burgundyNails();
		const { pages } = pageFor(nails, 'burgundy-nails');

		// Act
		const results = pages.map((page) => generateHubCopy(page, pages.filter(isIndexable)));

		// Assert
		for (const copy of results) {
			expect(copy.title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
			expect(copy.title.endsWith(' | Nail.ai')).toBe(true);
			expect(copy.heading).not.toBe(copy.title);
			expect(copy.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
		}
	});

	it('builds a keyword title with top subfacets', () => {
		// Arrange
		const { page, pages } = pageFor(burgundyNails(), 'burgundy-nails');

		// Act
		const copy = generateHubCopy(page, pages.filter(isIndexable));

		// Assert
		expect(copy.title).toBe('Burgundy Nail Designs: Matte, Party & Short Ideas | Nail.ai');
		expect(copy.heading).toBe('Burgundy manicure ideas');
	});

	it('writes an intro of 40-70 words that links to related hubs', () => {
		// Arrange
		const { pages } = pageFor(burgundyNails(), 'burgundy-nails');
		const indexable = pages.filter(isIndexable);

		// Act
		const results = indexable.map((page) => generateHubCopy(page, indexable));

		// Assert
		for (const { intro } of results) {
			const words = countIntroWords(intro);
			expect(words).toBeGreaterThanOrEqual(MIN_INTRO_WORDS);
			expect(words).toBeLessThanOrEqual(MAX_INTRO_WORDS);
			expect(intro.filter((segment) => segment.href).length).toBeLessThanOrEqual(MAX_INTRO_LINKS);
		}
	});

	it('uses the hand-written mood sentence first', () => {
		// Arrange
		const { page, pages } = pageFor(burgundyNails(), 'burgundy-nails');

		// Act
		const copy = generateHubCopy(page, pages.filter(isIndexable));

		// Assert
		expect(copy.intro[0]?.text.startsWith('Burgundy is the nail color')).toBe(true);
	});

	it('prefers curated editorial over generated copy', () => {
		// Arrange
		const { page, pages } = pageFor(burgundyNails(), 'burgundy-nails');
		const editorial = aHub({ intro: 'Curated.', metaDescription: 'Curated meta.' });

		// Act
		const copy = generateHubCopy({ ...page, editorial }, pages);

		// Assert
		expect(copy.intro).toEqual([{ text: 'Curated.' }]);
		expect(copy.description).toBe('Curated meta.');
	});

	it('shortens the title for long combinations', () => {
		// Arrange
		const nails = [aNail({ colors: ['burgundy'], types: ['micro french'], shape: 'almond', length: 'short', finishes: ['glossy'] })];
		const pages = getAllFacetPages(nails);
		const page = pages.reduce((longest, candidate) => candidate.slug.length > longest.slug.length ? candidate : longest);

		// Act
		const copy = generateHubCopy(page, []);

		// Assert
		expect(copy.title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
	});
});
