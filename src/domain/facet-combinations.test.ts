import { describe, expect, it } from 'vitest';
import { aNail } from '../test/builders';
import {
	findCoreStyleParentPage,
	findFirstFacetParentPage,
	getAllFacetPages,
	getFacetPages,
	getNailsForArea,
} from './facet-combinations';
import { SlugCollisionError } from './slug-collision';

describe('domain facet combinations', () => {
	it('returns no pages for empty input and the empty pedicure area', () => {
		// Arrange
		const nails = [] as const;

		// Act
		const result = {
			facetPages: getFacetPages(nails, 'pedicure'),
			allPages: getAllFacetPages(nails),
			areaNails: getNailsForArea(nails, 'pedicure'),
		};

		// Assert
		expect(result).toEqual({
			facetPages: [],
			allPages: [],
			areaNails: [],
		});
	});

	it('includes records marked for both areas in both collections', () => {
		// Arrange
		const manicureOnly = aNail({ slug: 'manicure-only', colors: ['rose gold'], typesOfNails: 'manicure' });
		const bothAreas = aNail({ slug: 'both-areas', colors: ['red'], typesOfNails: 'both' });
		const nails = [manicureOnly, bothAreas];

		// Act
		const result = {
			manicure: getNailsForArea(nails, 'manicure').map(({ slug }) => slug),
			pedicure: getNailsForArea(nails, 'pedicure').map(({ slug }) => slug),
			unknown: getNailsForArea(nails, 'unknown').map(({ slug }) => slug),
		};

		// Assert
		expect(result).toEqual({
			manicure: ['manicure-only', 'both-areas'],
			pedicure: ['both-areas'],
			unknown: [],
		});
	});

	it('creates populated pair and triple pages', () => {
		// Arrange
		const nail = aNail({
			colors: ['rose gold'],
			types: ['french'],
			shape: 'almond',
			length: 'short',
		});

		// Act
		const result = getAllFacetPages([nail])
			.filter((page) => page.area === 'manicure')
			.map((page) => page.slug);

		// Assert
		expect(result).toEqual([
			'rose-gold-nails',
			'french-nails',
			'almond-nails',
			'short-nails',
			'short-rose-gold-nails',
			'short-french-nails',
			'short-almond-nails',
			'rose-gold-french-nails',
			'rose-gold-almond-nails',
			'almond-french-nails',
			'short-rose-gold-french-nails',
			'short-rose-gold-almond-nails',
			'short-french-almond-nails',
			'rose-gold-french-almond-nails',
		]);
	});

	it('throws a typed error for duplicate single-facet slugs', () => {
		// Arrange
		const nail = aNail({ colors: ['french'], types: ['french'] });

		// Act
		const action = () => getFacetPages([nail], 'manicure');

		// Assert
		expect(action).toThrow(SlugCollisionError);
		expect(action).toThrow(/Facet URL conflict.*color.*type/);
	});

	it('throws a typed error for duplicate combination slugs', () => {
		// Arrange
		const nail = aNail({ colors: ['nude'], length: 'short', occasions: ['short-nude'] });

		// Act
		const action = () => getAllFacetPages([nail]);

		// Assert
		expect(action).toThrow(SlugCollisionError);
		expect(action).toThrow(/multiple facet combinations normalize to the same slug/);
	});

	describe('findCoreStyleParentPage', () => {
		const sixNails = (overrides: Parameters<typeof aNail>[0]) => Array.from({ length: 6 }, () => aNail(overrides));

		it('returns the type hub for a combination containing a type', () => {
			// Arrange
			const pages = getAllFacetPages(sixNails({ colors: ['pink'], types: ['french'], finishes: ['glitter'] }))
				.map((candidate) => candidate.slug === 'french-nails'
					? {
						...candidate,
						editorial: {
							area: 'manicure' as const,
							urlSlug: 'french-nails',
							intro: 'A curated introduction.',
							metaDescription: 'A curated description.',
							faq: [],
						},
					}
					: candidate);
			const page = pages.find(({ slug }) => slug === 'pink-french-nails');
			if (!page) throw new Error('missing page');

			// Act
			const result = findCoreStyleParentPage(page, pages);

			// Assert
			expect(result?.slug).toBe('french-nails');
		});

		it('returns nothing for a combination without a type', () => {
			// Arrange
			const pages = getAllFacetPages(sixNails({ colors: ['pink'], types: [], finishes: ['glitter'] }));
			const page = pages.find(({ facets }) => facets.length === 2);
			if (!page) throw new Error('missing page');

			// Act
			const result = findCoreStyleParentPage(page, pages);

			// Assert
			expect(result).toBeUndefined();
		});
	});

	describe('findFirstFacetParentPage', () => {
		it('returns nothing for a single-facet hub', () => {
			// Arrange
			const pages = getAllFacetPages([aNail({ occasions: ['wedding'] })]);
			const page = pages.find(({ slug }) => slug === 'wedding-nails');
			if (!page) throw new Error('missing page');

			// Act
			const result = findFirstFacetParentPage(page, pages);

			// Assert
			expect(result).toBeUndefined();
		});

		it('returns the indexable single-facet hub matching the combination first facet', () => {
			// Arrange
			const nails = Array.from({ length: 6 }, () => aNail({ colors: ['pink'], types: ['french'], length: 'short' }));
			const pages = getAllFacetPages(nails).map((candidate) => candidate.slug === 'pink-nails'
				? {
					...candidate,
					editorial: {
						area: 'manicure' as const,
						urlSlug: 'pink-nails',
						intro: 'A curated introduction.',
						metaDescription: 'A curated description.',
						faq: [],
					},
				}
				: candidate);
			const page = pages.find(({ slug }) => slug === 'pink-french-nails');
			if (!page) throw new Error('missing page');

			// Act
			const result = findFirstFacetParentPage(page, pages);

			// Assert
			expect(result?.slug).toBe('pink-nails');
		});

		it('returns nothing when the first-facet hub is not indexable', () => {
			// Arrange
			const pages = getAllFacetPages([aNail({ colors: ['pink'], types: ['french'] })]);
			const page = pages.find(({ slug }) => slug === 'pink-french-nails');
			if (!page) throw new Error('missing page');

			// Act
			const result = findFirstFacetParentPage(page, pages);

			// Assert
			expect(result).toBeUndefined();
		});
	});
});
