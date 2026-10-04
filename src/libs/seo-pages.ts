import { isNailArea, nailAreas, type NailArea } from '../areas';
import type { NailRecord } from './ai/nail-search';

export const facetKinds = ['color', 'type', 'occasion', 'season'] as const;

export type FacetKind = (typeof facetKinds)[number];

export interface NailFacetPage {
	area: NailArea;
	kind: FacetKind;
	value: string;
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
			return nail.season ? [nail.season] : [];
	}
}

export function getFacetPages(nails: readonly NailRecord[], area: NailArea): NailFacetPage[] {
	const areaNails = nails.filter((nail) => belongsToArea(nail, area));
	const pages: NailFacetPage[] = [];
	const slugs = new Map<string, { kind: FacetKind; value: string }>();

	for (const kind of facetKinds) {
		const values = [...new Set(areaNails.flatMap((nail) => valuesForFacet(nail, kind)))].sort();
		for (const value of values) {
			const slug = slugifyFacet(value);
			const existing = slugs.get(slug);
			if (!slug || existing) {
				const previous = existing ? `${existing.kind} "${existing.value}"` : 'an empty facet value';
				throw new Error(`Facet URL conflict for /${area}/${slug}/: ${previous} and ${kind} "${value}".`);
			}
			slugs.set(slug, { kind, value });
			pages.push({
				area,
				kind,
				value,
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
	return nailAreas.flatMap((area) => getFacetPages(nails, area));
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
		countLabel(uniqueValues(nails.flatMap((nail) => nail.season ? [nail.season] : [])).length, 'season'),
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

export function getFacetPageCopy(page: Pick<NailFacetPage, 'area' | 'kind' | 'value' | 'nails'>): SeoPageCopy {
	const area = page.area;
	const service = area === 'manicure' ? 'manicure' : 'pedicure';
	const value = page.value;
	const displayValue = capitalize(value);
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