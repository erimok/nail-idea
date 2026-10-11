import { describe, expect, it } from 'vitest';
import { aNail } from '../test/builders';
import { getAllFacetPages, getFacetPages, getNailsForArea } from './facet-combinations';
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
});
