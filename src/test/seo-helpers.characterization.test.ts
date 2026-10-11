import { describe, expect, it } from 'vitest';
import { getAllFacetPages, getFacetPages, getNailsForArea } from '../libs/seo-pages';
import { isIndexable } from '../domain/indexability';
import { aHub, aNail } from './builders';
import { getAreaPageCopy, getFacetPageCopy } from '../libs/seo-pages';
import { slugifyFacet } from '../libs/seo-pages';

describe('seo helper characterization', () => {
	it('captures current area filtering and single-facet pages', () => {
		// Arrange
		const manicure = aNail({
			slug: 'manicure-rose',
			title: 'Rose gold wedding manicure',
			description: 'Rose gold French nails for spring weddings.',
			colors: ['rose gold'],
			types: ['french'],
			occasions: ['wedding'],
			season: 'spring',
			shape: 'almond',
			length: 'short',
			finishes: ['glossy'],
			typesOfNails: 'manicure',
		});
		const bothAreas = aNail({
			slug: 'both-red',
			title: 'Red chrome nails',
			description: 'A bright red chrome design for parties.',
			colors: ['red'],
			types: ['solid'],
			occasions: ['party'],
			season: 'winter',
			finishes: ['chrome'],
			typesOfNails: 'both',
		});
		const nails = [manicure, bothAreas];

		// Act
		const result = {
			manicureNails: getNailsForArea(nails, 'manicure').map(({ slug }) => slug),
			pedicureNails: getNailsForArea(nails, 'pedicure').map(({ slug }) => slug),
			manicureFacetPages: getFacetPages(nails, 'manicure').map((page) => ({
				kind: page.kind,
				value: page.value,
				slug: page.slug,
				nails: page.nails.map(({ slug }) => slug),
			})),
		};

		// Assert
		expect(result).toEqual({
			manicureNails: ['manicure-rose', 'both-red'],
			pedicureNails: ['both-red'],
			manicureFacetPages: [
				{ kind: 'color', value: 'red', slug: 'red-nails', nails: ['both-red'] },
				{ kind: 'color', value: 'rose gold', slug: 'rose-gold-nails', nails: ['manicure-rose'] },
				{ kind: 'type', value: 'french', slug: 'french-nails', nails: ['manicure-rose'] },
				{ kind: 'type', value: 'solid', slug: 'solid-nails', nails: ['both-red'] },
				{ kind: 'occasion', value: 'party', slug: 'party-nails', nails: ['both-red'] },
				{ kind: 'occasion', value: 'wedding', slug: 'wedding-nails', nails: ['manicure-rose'] },
				{ kind: 'season', value: 'spring', slug: 'spring-nails', nails: ['manicure-rose'] },
				{ kind: 'season', value: 'winter', slug: 'winter-nails', nails: ['both-red'] },
				{ kind: 'shape', value: 'almond', slug: 'almond-nails', nails: ['manicure-rose'] },
				{ kind: 'length', value: 'short', slug: 'short-nails', nails: ['manicure-rose'] },
				{ kind: 'finishing', value: 'chrome', slug: 'chrome-nails', nails: ['both-red'] },
				{ kind: 'finishing', value: 'glossy', slug: 'glossy-nails', nails: ['manicure-rose'] },
			],
		});
	});

	it('captures current combination page generation', () => {
		// Arrange
		const nail = aNail({
			slug: 'combo-nail',
			colors: ['rose gold'],
			types: ['french'],
			shape: 'almond',
			typesOfNails: 'manicure',
		});

		// Act
		const result = getAllFacetPages([nail]).map((page) => ({
			area: page.area,
			kind: page.kind,
			value: page.value,
			slug: page.slug,
			facets: page.facets,
			nails: page.nails.map(({ slug }) => slug),
		}));

		// Assert
		expect(result).toEqual([
			{
				area: 'manicure',
				kind: 'color',
				value: 'rose gold',
				slug: 'rose-gold-nails',
				facets: [{ kind: 'color', value: 'rose gold' }],
				nails: ['combo-nail'],
			},
			{
				area: 'manicure',
				kind: 'type',
				value: 'french',
				slug: 'french-nails',
				facets: [{ kind: 'type', value: 'french' }],
				nails: ['combo-nail'],
			},
			{
				area: 'manicure',
				kind: 'shape',
				value: 'almond',
				slug: 'almond-nails',
				facets: [{ kind: 'shape', value: 'almond' }],
				nails: ['combo-nail'],
			},
			{
				area: 'manicure',
				kind: 'combination',
				value: 'rose gold french',
				slug: 'rose-gold-french-nails',
				facets: [
					{ kind: 'color', value: 'rose gold' },
					{ kind: 'type', value: 'french' },
				],
				nails: ['combo-nail'],
			},
			{
				area: 'manicure',
				kind: 'combination',
				value: 'rose gold almond',
				slug: 'rose-gold-almond-nails',
				facets: [
					{ kind: 'color', value: 'rose gold' },
					{ kind: 'shape', value: 'almond' },
				],
				nails: ['combo-nail'],
			},
			{
				area: 'manicure',
				kind: 'combination',
				value: 'almond french',
				slug: 'almond-french-nails',
				facets: [
					{ kind: 'shape', value: 'almond' },
					{ kind: 'type', value: 'french' },
				],
				nails: ['combo-nail'],
			},
			{
				area: 'manicure',
				kind: 'combination',
				value: 'rose gold french almond',
				slug: 'rose-gold-french-almond-nails',
				facets: [
					{ kind: 'color', value: 'rose gold' },
					{ kind: 'type', value: 'french' },
					{ kind: 'shape', value: 'almond' },
				],
				nails: ['combo-nail'],
			},
		]);
	});

	it('captures current slug, indexability, and generated copy', () => {
		// Arrange
		const editorial = aHub({
			area: 'manicure',
			urlSlug: 'rose-gold-nails',
			intro: 'Curated rose gold intro.',
			metaDescription: 'Curated rose gold description.',
		});
		const nail = aNail({
			slug: 'rose-gold-idea',
			description: 'Rose gold French nails for spring weddings.',
			colors: ['rose gold'],
			types: ['french'],
			occasions: ['wedding'],
			season: 'spring',
			typesOfNails: 'manicure',
		});

		// Act
		const result = {
			slugs: ['Rose Gold', 'Baby shower', 'Ombré'].map((value) => slugifyFacet(value)),
			indexable: [
				isIndexable({ nails: Array(6), editorial }),
				isIndexable({ nails: Array(6) }),
			],
			facetCopy: getFacetPageCopy({
				area: 'manicure',
				kind: 'color',
				value: 'rose gold',
				facets: [{ kind: 'color', value: 'rose gold' }],
				nails: [nail],
				editorial,
			}),
			areaCopy: getAreaPageCopy('manicure', [nail]),
		};

		// Assert
		expect(result).toEqual({
			slugs: ['rose-gold', 'baby-shower', 'ombre'],
			indexable: [true, false],
			facetCopy: {
				title: 'Rose gold Manicure Ideas | Nail.ai',
				description: 'Curated rose gold description.',
				heading: 'Rose gold Manicure Ideas',
				prompt: 'rose gold manicure ideas',
				paragraphs: ['Curated rose gold intro.'],
			},
			areaCopy: {
				title: 'Manicure ideas | Nail.ai',
				description: 'Browse 1 manicure design in the Nail.ai manicure collection, with ideas organized by color, style, occasion, and season.',
				heading: 'Manicure ideas',
				prompt: 'Show me manicure nail ideas',
				paragraphs: [
					'We found 1 manicure design in the Nail.ai manicure collection. Rose gold French nails for spring weddings.',
					'The collection spans 1 color, 1 design style, 1 occasion, 1 season. Browse the designs below, or describe a color, shape, finish, or occasion in the search above to narrow down your next manicure.',
				],
			},
		});
	});
});
