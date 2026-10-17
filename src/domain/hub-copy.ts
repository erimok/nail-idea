import type { NailArea } from './areas';
import { isSubpageOfFacetPage, type NailFacetPage } from './facet-combinations';
import { facetKinds, getFacetValues } from './facets/registry';
import { facetKindMoods, facetMoods } from './hub-moods';
import { buildFacetRoute } from './routes';

export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;
export const MIN_INTRO_WORDS = 40;
export const MAX_INTRO_WORDS = 70;
export const MAX_SUBFACETS = 3;
export const MAX_INTRO_LINKS = 3;

const SITE_SUFFIX = ' | Nail.ai';

const areaTitleNouns: Readonly<Record<NailArea, string>> = {
	manicure: 'Nail Designs',
	pedicure: 'Pedicure Ideas',
};

export type IntroSegment = { text: string; href?: string };

export interface HubCopy {
	title: string;
	description: string;
	heading: string;
	intro: readonly IntroSegment[];
}

type HubCopyPage = Pick<NailFacetPage, 'area' | 'kind' | 'value' | 'facets' | 'slug' | 'nails' | 'editorial'>;
type RelatedCandidate = Pick<NailFacetPage, 'area' | 'facets' | 'slug' | 'nails'>;

const proseFacetNames: Readonly<Record<string, string>> = {
	french: 'French tip',
	'micro french': 'micro French',
};

function proseDisplay(values: readonly string[]): string {
	return values.map((value) => proseFacetNames[value] ?? value).join(' ');
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function joinList(items: readonly string[], conjunction: string): string {
	if (items.length <= 1) return items.join('');
	return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1]}`;
}

export function topSubfacets(page: Pick<HubCopyPage, 'facets' | 'nails'>, limit = MAX_SUBFACETS): string[] {
	const pageKinds = new Set(page.facets.map((facet) => facet.kind));
	const pageValues = new Set(page.facets.map((facet) => facet.value));
	const counts = new Map<string, number>();

	for (const kind of facetKinds) {
		if (pageKinds.has(kind)) continue;
		for (const nail of page.nails) {
			for (const value of getFacetValues(nail, kind)) {
				if (!pageValues.has(value)) counts.set(value, (counts.get(value) ?? 0) + 1);
			}
		}
	}

	return [...counts.entries()]
		.sort(([leftValue, leftCount], [rightValue, rightCount]) => rightCount - leftCount || leftValue.localeCompare(rightValue))
		.slice(0, limit)
		.map(([value]) => value);
}

export function rankRelatedHubs<T extends RelatedCandidate>(
	page: Pick<HubCopyPage, 'area' | 'slug' | 'facets' | 'nails' | 'kind'>,
	subfacets: readonly string[],
	candidates: readonly T[],
	limit = MAX_INTRO_LINKS,
): T[] {
	const relevant = new Set([...page.facets.map((facet) => facet.value), ...subfacets]);
	const pageNailSlugs = new Set(page.nails.map((nail) => nail.slug));

	return candidates
		.filter((candidate) => candidate.area === page.area
			&& candidate.slug !== page.slug
			&& (page.kind !== 'type' || isSubpageOfFacetPage(page, candidate))
			&& candidate.nails.some((nail) => pageNailSlugs.has(nail.slug)))
		.map((candidate) => ({ candidate, score: candidate.facets.filter((facet) => relevant.has(facet.value)).length }))
		.filter(({ score }) => score > 0)
		.sort((left, right) => right.score - left.score
			|| right.candidate.nails.length - left.candidate.nails.length
			|| left.candidate.slug.localeCompare(right.candidate.slug))
		.slice(0, limit)
		.map(({ candidate }) => candidate);
}

function buildTitle(display: string, area: NailArea, subfacets: readonly string[]): string {
	const noun = areaTitleNouns[area];
	const words = display.split(' ');

	for (let count = subfacets.length; count >= 0; count -= 1) {
		const details = count > 0 ? `: ${joinList(subfacets.slice(0, count).map(capitalize), '&')} Ideas` : '';
		const title = `${display} ${noun}${details}${SITE_SUFFIX}`;
		if (title.length <= MAX_TITLE_LENGTH) return title;
	}

	while (words.length > 1) {
		words.pop();
		const title = `${words.join(' ')} ${noun}${SITE_SUFFIX}`;
		if (title.length <= MAX_TITLE_LENGTH) return title;
	}

	return `${words[0]}${SITE_SUFFIX}`.slice(0, MAX_TITLE_LENGTH);
}

function buildDescription(subject: string, subfacets: readonly string[]): string {
	for (let count = subfacets.length; count >= 0; count -= 1) {
		const details = count > 0 ? `: ${joinList(subfacets.slice(0, count), 'and')} looks` : '';
		const description = `Browse ${subject} ideas${details}. Save your favorites on Nail.ai.`;
		if (description.length <= MAX_DESCRIPTION_LENGTH) return description;
	}

	return `Browse ${subject} ideas on Nail.ai.`.slice(0, MAX_DESCRIPTION_LENGTH);
}

function buildIntro(
	page: HubCopyPage,
	display: string,
	subfacets: readonly string[],
	related: readonly RelatedCandidate[],
): IntroSegment[] {
	const mood = facetMoods[page.value]
		?? (page.kind === 'combination' ? `${display} nails bring a few favorite details together in one look.` : facetKindMoods[page.kind](display));
	const browse = subfacets.length > 0
		? ` Browse ${joinList(subfacets, 'and')} ${page.area} ideas`
		: ` Browse ${display} ${page.area} ideas`;
	const segments: IntroSegment[] = [{ text: `${mood}${browse}` }];

	if (related.length > 0) {
		segments.push({ text: ', or jump to ' });
		related.forEach((hub, index) => {
			const label = proseDisplay(hub.facets.map((facet) => facet.value));
			if (index > 0) segments.push({ text: index === related.length - 1 ? ' and ' : ', ' });
			segments.push({ text: `${label} ${page.area}`, href: buildFacetRoute(hub.area, hub.slug) });
		});
	}

	segments.push({ text: '. Save the one that fits your hands.' });

	return segments;
}

export function countIntroWords(intro: readonly IntroSegment[]): number {
	return intro.map(({ text }) => text).join('').split(/\s+/).filter(Boolean).length;
}

export function generateHubCopy(page: HubCopyPage, indexableHubs: readonly RelatedCandidate[]): HubCopy {
	const rawSubfacets = topSubfacets(page);
	const subfacets = rawSubfacets.map((value) => proseDisplay([value]));
	const display = proseDisplay(page.facets.map((facet) => facet.value));
	const subject = `${display} ${page.area}`;
	const generatedDescription = buildDescription(subject, subfacets);
	const editorial = page.editorial;

	return {
		title: buildTitle(capitalize(display), page.area, subfacets),
		description: editorial?.metaDescription.trim() || generatedDescription,
		heading: `${capitalize(display)} ${page.area} ideas`,
		intro: editorial?.intro.trim()
			? [{ text: editorial.intro }]
			: buildIntro(page, capitalize(display), subfacets, rankRelatedHubs(page, rawSubfacets, indexableHubs)),
	};
}
