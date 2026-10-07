import { describe, expect, it } from 'vitest';
import type { NailRecord } from './ai/nail-search';
import { getAllFacetPages, getAreaPageCopy, getFacetPageCopy, getFacetPages, getNailsForArea, slugifyFacet } from './seo-pages';

const makeNail = (overrides: Partial<NailRecord> = {}): NailRecord => ({
	slug: 'sample',
	title: 'Sample nails',
	image: '',
	description: '',
	colors: [],
	types: [],
	occasions: [],
	typesOfNails: 'manicure',
	season: undefined,
	shape: undefined,
	length: undefined,
	finishes: [],
	nailConcerns: [],
	...overrides,
});

describe('pSEO facet pages', () => {
	it('creates only populated facets and includes records for both areas', () => {
		const manicure = makeNail({ colors: ['rose gold'], types: ['french'], occasions: ['wedding'], season: 'spring' });
		const both = makeNail({ slug: 'both', typesOfNails: 'both', colors: ['rose gold', 'red'] });

		expect(getFacetPages([manicure, both], 'manicure')).toEqual(expect.arrayContaining([
			expect.objectContaining({ kind: 'color', value: 'rose gold', slug: 'rose-gold-nails', nails: [manicure, both] }),
			expect.objectContaining({ kind: 'type', value: 'french', nails: [manicure] }),
		]));
		expect(getFacetPages([manicure, both], 'pedicure')).toEqual([
			expect.objectContaining({ kind: 'color', value: 'red' }),
			expect.objectContaining({ kind: 'color', value: 'rose gold' }),
		]);
		expect(getNailsForArea([manicure, both], 'unknown')).toEqual([]);
	});

	it('normalizes multiword and accented values into URL slugs', () => {
		expect(slugifyFacet('Rose Gold')).toBe('rose-gold');
		expect(slugifyFacet('Baby shower')).toBe('baby-shower');
		expect(slugifyFacet('Ombré')).toBe('ombre');
	});

	it('rejects collisions between facet categories', () => {
		const nail = makeNail({ colors: ['french'], types: ['french'] });

		expect(() => getFacetPages([nail], 'manicure')).toThrow(/Facet URL conflict.*color.*type/);
	});

	it('creates populated combinations through the third level', () => {
		const nail = makeNail({
			colors: ['nude'],
			types: ['french'],
			shape: 'almond',
			length: 'short',
			finishes: ['chrome'],
		});
		const pages = getAllFacetPages([nail]).filter((page) => page.area === 'manicure');

		expect(pages).toEqual(expect.arrayContaining([
			expect.objectContaining({ slug: 'short-nude-french-nails', kind: 'combination', nails: [nail] }),
			expect.objectContaining({ slug: 'short-french-almond-nails', kind: 'combination', nails: [nail] }),
			expect.objectContaining({ slug: 'almond-french-nails', kind: 'combination', nails: [nail] }),
			expect.objectContaining({ slug: 'chrome-nude-almond-nails', kind: 'combination', nails: [nail] }),
		]));
		expect(pages).toHaveLength(25);
		expect(pages.some((page) => page.slug === 'short-chrome-nude-french-nails')).toBe(false);
	});

	it('merges matching nails and rejects ambiguous combination slugs', () => {
		const first = makeNail({ colors: ['nude'], types: ['french'], shape: 'almond', length: 'short', finishes: ['chrome'] });
		const second = makeNail({ slug: 'second', colors: ['nude'], types: ['french'], shape: 'almond', length: 'short', finishes: ['chrome'] });
		const pages = getAllFacetPages([first, second]);

		expect(pages.find((page) => page.slug === 'short-nude-french-nails')?.nails).toEqual([first, second]);
		expect(() => getAllFacetPages([makeNail({ colors: ['nude'], length: 'short', occasions: ['short-nude'] })]))
			.toThrow(/multiple facet combinations normalize to the same slug/);
	});

	it('uses actual record counts and attributes in readable page copy', () => {
		const nail = makeNail({
			description: 'A crisp red-and-white French manicure for a spring wedding.',
			colors: ['red', 'white'],
			types: ['french'],
			occasions: ['wedding'],
			season: 'spring',
			finishes: ['glossy'],
		});
		const facetCopy = getFacetPageCopy({ area: 'manicure', kind: 'color', value: 'red', facets: [{ kind: 'color', value: 'red' }], nails: [nail] });
		const areaCopy = getAreaPageCopy('manicure', [nail]);

		expect(facetCopy.paragraphs.join(' ')).toContain('1 red manicure design');
		expect(facetCopy.paragraphs.join(' ')).toContain('A crisp red-and-white French manicure for a spring wedding.');
		expect(areaCopy.paragraphs.join(' ')).toContain('1 manicure design');
		expect(areaCopy.paragraphs.join(' ')).toContain('2 colors');
	});
});