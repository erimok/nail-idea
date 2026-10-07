import { isNailArea, nailAreas, type NailArea } from '../areas';
import type { NailRecord } from './ai/nail-search';

function seasonValues(value: NailRecord['season']): readonly string[] {
	if (value === undefined) return [];
	if (typeof value === 'string') return [value];
	return [...value];
}

export const facetKinds = ['color', 'type', 'occasion', 'season', 'shape', 'length', 'finishing'] as const;

export type FacetKind = (typeof facetKinds)[number];
type SeoFacetKind = Extract<FacetKind, 'color' | 'type' | 'shape' | 'length' | 'finishing'>;

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
}

export interface SeoPageCopy {
	title: string;
	description: string;
	heading: string;
	prompt: string;
	paragraphs: [string, string];
}

export function slugifyFacet(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function belongsToArea(nail: NailRecord, area: NailArea): boolean {
	return nail.typesOfNails === area || nail.typesOfNails === 'both';
}

function valuesForFacet(nail: NailRecord, kind: FacetKind): readonly string[] {
	switch (kind) {
		case 'color':
			return nail.colors;
		case 'type':
			return nail.types;
		case 'occasion':
			return nail.occasions;
		case 'season':
			return seasonValues(nail.season);
		case 'shape':
			return nail.shape ? [nail.shape] : [];
		case 'length':
			return nail.length ? [nail.length] : [];
		case 'finishing':
			return nail.finishes;
	}
}

export function getFacetPages(nails: readonly NailRecord[], area: NailArea): NailFacetPage[] {
	const areaNails = nails.filter((nail) => belongsToArea(nail, area));
	const pages: NailFacetPage[] = [];
	const slugs = new Map<string, { kind: FacetKind; value: string }>();

	for (const kind of facetKinds) {
		const values = [...new Set(areaNails.flatMap((nail) => valuesForFacet(nail, kind)))].sort();
		for (const value of values) {
			const facetSlug = slugifyFacet(value);
			const slug = `${facetSlug}-nails`;
			const existing = slugs.get(slug);
			if (!facetSlug || existing) {
				const previous = existing ? `${existing.kind} "${existing.value}"` : 'an empty facet value';
				throw new Error(`Facet URL conflict for /${area}/${slug}/: ${previous} and ${kind} "${value}".`);
			}
			slugs.set(slug, { kind, value });
			pages.push({
				area,
				kind,
				value,
				facets: [{ kind, value }],
				slug,
				nails: areaNails.filter((nail) => valuesForFacet(nail, kind).includes(value)),
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
	const dimensionOrder: SeoFacetKind[] = ['length', 'finishing', 'color', 'type', 'shape'];
	const dimensionSets: SeoFacetKind[][] = [2, 3]
		.flatMap((size) => getCombinations(dimensionOrder, size))
		.map((kinds) => kinds.length === 2 && kinds.includes('shape') && kinds.includes('type')
			? ['shape', 'type']
			: kinds);
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
				const values = kinds.map((kind) => valuesForFacet(nail, kind));
				if (values.some((facetValues) => facetValues.length === 0)) continue;

				for (const facets of valueCombinations(kinds, values)) {
					const slug = `${facets.map((facet) => slugifyFacet(facet.value)).join('-')}-nails`;
					const identity = JSON.stringify(facets);
					const existing = pagesBySlug.get(slug);
					if (existing && existing.identity !== identity) {
						throw new Error(`Facet URL conflict for /${area}/${slug}/: multiple facet combinations normalize to the same slug.`);
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

function valueCombinations(kinds: readonly SeoFacetKind[], values: readonly (readonly string[])[]): NailFacetSelection[][] {
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

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function countLabel(count: number, singular: string, plural = `${singular}s`): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

function uniqueValues(values: readonly string[]): string[] {
	return [...new Set(values)].sort();
}

function getAreaDetails(nails: readonly NailRecord[]): string {
	const details = [
		countLabel(uniqueValues(nails.flatMap((nail) => nail.colors)).length, 'color'),
		countLabel(uniqueValues(nails.flatMap((nail) => nail.types)).length, 'design style'),
		countLabel(uniqueValues(nails.flatMap((nail) => nail.occasions)).length, 'occasion'),
		countLabel(uniqueValues(nails.flatMap((nail) => seasonValues(nail.season))).length, 'season'),
	].filter((detail) => !detail.startsWith('0 '));

	return details.length > 0 ? `The collection spans ${details.join(', ')}.` : '';
}

function getRecordDescriptions(nails: readonly NailRecord[]): string {
	return [...new Set(nails.map((nail) => nail.description.trim()).filter(Boolean))]
		.slice(0, 2)
		.map((description) => /[.!?]$/.test(description) ? description : `${description}.`)
		.join(' ');
}

export function getAreaPageCopy(area: NailArea, nails: readonly NailRecord[]): SeoPageCopy {
	const service = area === 'manicure' ? 'manicure' : 'pedicure';
	const title = `${capitalize(service)} ideas | Nail.ai`;
	const designs = countLabel(nails.length, `${service} design`, `${service} designs`);
	const details = getAreaDetails(nails);
	const examples = getRecordDescriptions(nails);
	return {
		title,
		description: `Browse ${designs} in the Nail.ai ${service} collection, with ideas organized by color, style, occasion, and season.`,
		heading: `${capitalize(service)} ideas`,
		prompt: `Show me ${service} nail ideas`,
		paragraphs: [
			[`We found ${designs} in the Nail.ai ${service} collection.`, examples].filter(Boolean).join(' '),
			[details, `Browse the designs below, or describe a color, shape, finish, or occasion in the search above to narrow down your next ${service}.`].filter(Boolean).join(' '),
		],
	};
}

export function getFacetPageCopy(page: Pick<NailFacetPage, 'area' | 'kind' | 'value' | 'facets' | 'nails'>): SeoPageCopy {
	const area = page.area;
	const service = area === 'manicure' ? 'manicure' : 'pedicure';
	const value = page.value;
	const displayValue = page.kind === 'combination'
		? page.facets.map((facet) => capitalize(facet.value)).join(' ')
		: capitalize(value);
	const designs = countLabel(
		page.nails.length,
		`${value} ${service} design`,
		`${value} ${service} designs`,
	);
	const heading = `${displayValue} ${capitalize(service)} Ideas`;
	const examples = getRecordDescriptions(page.nails);
	return {
		title: `${heading} | Nail.ai`,
		description: `Explore ${designs} in the Nail.ai collection.`,
		heading,
		prompt: `${value} ${service} ideas`,
		paragraphs: [
			[`We found ${designs} in the Nail.ai collection.`, examples].filter(Boolean).join(' '),
			`Compare the looks below, or add a shape, finish, or another detail to the search above to refine your ${service} idea.`,
		],
	};
}

export function formatFacetLabel(page: Pick<NailFacetPage, 'value'>): string {
	return capitalize(page.value);
}