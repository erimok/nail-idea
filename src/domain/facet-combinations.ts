import type { NailRecord } from './nail';
import { isNailArea, nailAreas, type NailArea } from './areas';
import { combinableFacetKinds, coreStyleFacetKind, facetKinds, getFacetValues, type CombinableFacetKind, type FacetKind } from './facets/registry';
import type { HubEditorial } from './hub-types';
import { isIndexable } from './indexability';
import { normalizeSlug } from './slug';
import { createCombinationSlugCollisionError, createFacetSlugCollisionError } from './slug-collision';

export interface NailFacetSelection {
	kind: FacetKind;
	value: string;
}

export interface NailFacetPage {
	area: NailArea;
	kind: FacetKind | 'combination';
	value: string;
	facets: NailFacetSelection[];
	slug: string;
	nails: NailRecord[];
	editorial?: HubEditorial;
}

export function isSubpageOfFacetPage(
	parent: Pick<NailFacetPage, 'facets'>,
	candidate: Pick<NailFacetPage, 'facets'>,
): boolean {
	return candidate.facets.length > parent.facets.length
		&& parent.facets.every((parentFacet) => candidate.facets.some((facet) =>
			facet.kind === parentFacet.kind && facet.value === parentFacet.value));
}

export function isDirectSubpageOfFacetPage(
	parent: Pick<NailFacetPage, 'facets'>,
	candidate: Pick<NailFacetPage, 'facets'>,
): boolean {
	return candidate.facets.length === parent.facets.length + 1
		&& isSubpageOfFacetPage(parent, candidate);
}

export function findCoreStyleParentPage<T extends Pick<NailFacetPage, 'area' | 'facets' | 'nails'>>(
	page: Pick<NailFacetPage, 'area' | 'facets'>,
	pages: readonly T[],
): T | undefined {
	const coreFacets = page.facets.filter((facet) => facet.kind === coreStyleFacetKind);

	if (page.facets.length < 2) return undefined;

	for (const coreFacet of coreFacets) {
		const parent = pages.find((candidate) => candidate.area === page.area
			&& candidate.facets.length === 1
			&& candidate.facets[0].kind === coreFacet.kind
			&& candidate.facets[0].value === coreFacet.value);
		if (parent && isIndexable(parent)) return parent;
	}

	return undefined;
}

function belongsToArea(nail: NailRecord, area: NailArea): boolean {
	return nail.typesOfNails === area || nail.typesOfNails === 'both';
}

function orderCombinationFacets(kinds: readonly CombinableFacetKind[]): readonly CombinableFacetKind[] {
	if (kinds.length === 2 && kinds.includes('shape') && kinds.includes('type')) {
		return ['shape', 'type'];
	}

	return kinds;
}

export function getFacetPages(nails: readonly NailRecord[], area: NailArea): NailFacetPage[] {
	const areaNails = nails.filter((nail) => belongsToArea(nail, area));
	const pages: NailFacetPage[] = [];
	const slugs = new Map<string, { kind: FacetKind; value: string }>();

	for (const kind of facetKinds) {
		const values = [...new Set(areaNails.flatMap((nail) => getFacetValues(nail, kind)))].sort();
		for (const value of values) {
			const facetSlug = normalizeSlug(value);
			const slug = `${facetSlug}-nails`;
			const existing = slugs.get(slug);

			if (!facetSlug || existing) {
				const previous = existing ? `${existing.kind} "${existing.value}"` : 'an empty facet value';
				throw createFacetSlugCollisionError(area, slug, previous, `${kind} "${value}"`);
			}

			slugs.set(slug, { kind, value });
			pages.push({
				area,
				kind,
				value,
				facets: [{ kind, value }],
				slug,
				nails: areaNails.filter((nail) => getFacetValues(nail, kind).includes(value)),
			});
		}
	}

	return pages;
}

export function getNailsForArea(nails: readonly NailRecord[], area: string): NailRecord[] {
	if (!isNailArea(area)) return [];
	return nails.filter((nail) => belongsToArea(nail, area));
}

export function getAllFacetPages(nails: readonly NailRecord[]): NailFacetPage[] {
	const dimensionSets: readonly (readonly CombinableFacetKind[])[] = [2, 3]
		.flatMap((size) => getCombinations(combinableFacetKinds, size))
		.map((kinds) => orderCombinationFacets(kinds));
	const pages: NailFacetPage[] = [];

	for (const area of nailAreas) {
		const areaNails = nails.filter((nail) => belongsToArea(nail, area));
		const areaPages = getFacetPages(areaNails, area);
		const pagesBySlug = new Map(areaPages.map((page) => [page.slug, {
			identity: JSON.stringify(page.facets),
			page,
			nails: new Map(page.nails.map((nail) => [nail.slug, nail])),
		}]));

		for (const nail of areaNails) {
			for (const kinds of dimensionSets) {
				const values = kinds.map((kind) => getFacetValues(nail, kind));
				if (values.some((facetValues) => facetValues.length === 0)) continue;

				for (const facets of valueCombinations(kinds, values)) {
					const slug = `${facets.map((facet) => normalizeSlug(facet.value)).join('-')}-nails`;
					const identity = JSON.stringify(facets);
					const existing = pagesBySlug.get(slug);

					if (existing && existing.identity !== identity) {
						throw createCombinationSlugCollisionError(area, slug);
					}

					if (existing) {
						existing.nails.set(nail.slug, nail);
						continue;
					}

					const page: NailFacetPage = {
						area,
						kind: 'combination',
						value: facets.map((facet) => facet.value).join(' '),
						facets,
						slug,
						nails: [nail],
					};
					pagesBySlug.set(slug, { identity, page, nails: new Map([[nail.slug, nail]]) });
				}
			}
		}

		for (const { page, nails: pageNails } of pagesBySlug.values()) {
			pages.push({ ...page, nails: [...pageNails.values()] });
		}
	}

	return pages;
}

function getCombinations<T>(values: readonly T[], size: number): T[][] {
	if (size === 0) return [[]];
	return values.flatMap((value, index) => getCombinations(values.slice(index + 1), size - 1).map((rest) => [value, ...rest]));
}

function valueCombinations(
	kinds: readonly CombinableFacetKind[],
	values: readonly (readonly string[])[],
): NailFacetSelection[][] {
	const combinations: NailFacetSelection[][] = [];

	const collect = (index: number, facets: NailFacetSelection[]) => {
		if (index === kinds.length) {
			combinations.push(facets);
			return;
		}

		for (const value of values[index]) {
			collect(index + 1, [...facets, { kind: kinds[index], value }]);
		}
	};

	collect(0, []);
	return combinations;
}

export function getRelatedNails(nails: readonly NailRecord[], selectedNail: NailRecord, limit = 4): NailRecord[] {
	return nails
		.filter((nail) => nail.slug !== selectedNail.slug)
		.map((nail) => ({
			nail,
			score: Number(nail.shape === selectedNail.shape && Boolean(nail.shape))
				+ nail.colors.filter((color) => selectedNail.colors.includes(color)).length,
		}))
		.filter(({ score }) => score > 0)
		.sort((left, right) => right.score - left.score || left.nail.title.localeCompare(right.nail.title))
		.slice(0, limit)
		.map(({ nail }) => nail);
}
