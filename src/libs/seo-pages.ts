import type { NailArea } from '../domain/areas';
import type { NailFacetPage } from '../domain/facet-combinations';
import type { NailRecord } from './ai/nail-search';
export { getAllFacetPages, getFacetPages, getNailsForArea, getRelatedNails, type NailFacetPage, type NailFacetSelection } from '../domain/facet-combinations';
export { isIndexablePage, MIN_DESIGNS_FOR_INDEX as minimumDesignsForIndexing } from '../domain/indexability';
export { facetKinds } from '../domain/facets/registry';
export { normalizeSlug as slugifyFacet } from '../domain/slug';

function seasonValues(value: NailRecord['season']): readonly string[] {
	if (value === undefined) return [];
	if (typeof value === 'string') return [value];
	return [...value];
}

export interface SeoPageCopy {
	title: string;
	description: string;
	heading: string;
	prompt: string;
	paragraphs: readonly string[];
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
	const service = area;
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

export function getFacetPageCopy(page: Pick<NailFacetPage, 'area' | 'kind' | 'value' | 'facets' | 'nails' | 'editorial'>): SeoPageCopy {
	const area = page.area;
	const service = area;
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
	return {
		title: `${heading} | Nail.ai`,
		description: page.editorial?.metaDescription || `Explore ${designs} organized around ${page.facets.map((facet) => facet.value).join(', ')}.`,
		heading,
		prompt: `${value} ${service} ideas`,
		paragraphs: page.editorial?.intro
			? [page.editorial.intro]
			: [`Browse ${designs} in the Nail.ai collection. Use the search above to add another detail and compare matching looks.`],
	};
}

export function formatFacetLabel(page: Pick<NailFacetPage, 'value'>): string {
	return capitalize(page.value);
}