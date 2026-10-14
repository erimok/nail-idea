import { nailAreas, type NailArea } from '../domain/areas';
import {
	getFacetPages,
	getNailsForArea,
	type NailFacetPage,
	type NailFacetSelection,
} from '../domain/facet-combinations';
import { facetKinds, type FacetKind } from '../domain/facets/registry';
import type { HubEditorial } from '../domain/hub-types';
import { isIndexable, isIndexablePage } from '../domain/indexability';
import type { NailRecord, NailSearchRecord } from '../domain/nail';
import type { NavigationGroup, NavigationPlacement } from '../domain/site-content';
import { buildAreaRoute, buildFacetRoute } from '../domain/routes';
import type {
	BreadcrumbViewModel,
	BrowseLinkGroupViewModel,
	FacetBrowseLinksViewModel,
	FaqItemViewModel,
	HomepageCategoryViewModel,
	HomepageBrowseFeatureViewModel,
	SiteChromeViewModel,
} from './view-models';

interface SeoPageCopy {
	title: string;
	description: string;
	heading: string;
	prompt: string;
	paragraphs: readonly string[];
}

interface CollectionStructuredDataInput {
	canonical: string;
	heading: string;
	description: string;
	nails: readonly NailRecord[];
	breadcrumbs: readonly BreadcrumbViewModel[];
	faq: readonly FaqItemViewModel[];
}

function buildImageGalleryStructuredData(
	canonical: string,
	name: string,
	nails: readonly NailRecord[],
): Record<string, unknown> {
	return {
		'@type': 'ImageGallery',
		'@id': `${canonical}#gallery`,
		name,
		url: canonical,
		mainEntityOfPage: canonical,
		associatedMedia: nails.flatMap((nail) => {
			const imageUrl = nail.imageSrc || nail.image;
			if (!imageUrl) return [];

			return [{
				'@type': 'ImageObject',
				contentUrl: buildCanonicalUrl(canonical, imageUrl),
				name: nail.title,
				caption: nail.imageAlt ?? nail.description,
			}];
		}),
	};
}

const browseGroupDefinitions: readonly { kind: FacetKind; label: string }[] = [
	{ kind: 'color', label: 'Colors' },
	{ kind: 'type', label: 'Design styles' },
	{ kind: 'occasion', label: 'Occasions' },
	{ kind: 'season', label: 'Seasons' },
	{ kind: 'shape', label: 'Shapes' },
	{ kind: 'length', label: 'Lengths' },
	{ kind: 'finishing', label: 'Finishes' },
];

const headerBrowseGroupDefinitions: readonly { kind: FacetKind; label: string }[] = [
	{ kind: 'type', label: 'Type' },
	{ kind: 'color', label: 'Color' },
	{ kind: 'shape', label: 'Shape' },
	{ kind: 'finishing', label: 'Finishes' },
	{ kind: 'length', label: 'Length' },
];

const homepageCategoryDefinitions: readonly {
	title: string;
	description: string;
	matches: (page: NailFacetPage) => boolean;
}[] = [
	{ title: 'Nail shapes', description: 'Almond, square, round, oval, coffin, and more. Pick a shape that suits your nail length and daily routine.', matches: (page) => page.kind === 'shape' },
	{ title: 'Nail colors', description: 'From soft nudes and milky pinks to burgundy, red, and chrome. Find shades to suit your wardrobe and personal style.', matches: (page) => page.kind === 'color' },
	{ title: 'Designs by occasion', description: 'Wedding, office, date night, vacation, birthday, and holiday nails, chosen to fit the moment.', matches: (page) => page.kind === 'occasion' },
	{ title: 'Seasonal nails', description: 'Fresh spring pastels, summer brights, deep autumn tones, and winter classics.', matches: (page) => page.kind === 'season' },
	{ title: 'French and micro French', description: 'Classic white tips, thin micro French lines, and colored variations that stay polished and wearable.', matches: (page) => page.kind === 'type' && /french/i.test(page.value) },
	{ title: 'Short nails', description: 'Neat, low-maintenance ideas for short nails that still look intentional.', matches: (page) => page.kind === 'length' && page.value.toLowerCase() === 'short' },
];

function seasonValues(value: NailRecord['season']): readonly string[] {
	if (value === undefined) return [];
	if (typeof value === 'string') return [value];
	return [...value];
}

export function attachHubEditorial(
	pages: readonly NailFacetPage[],
	entries: readonly HubEditorial[],
): NailFacetPage[] {
	return pages.map((page) => ({
		...page,
		editorial: entries.find((entry) => entry.area === page.area && entry.urlSlug === page.slug),
	}));
}

export function toSearchRecords(nails: readonly NailRecord[]): NailSearchRecord[] {
	return nails.map(({ image: _image, ...nail }) => nail);
}

export function buildCanonicalUrl(siteUrl: string, path: string): string {
	return new URL(path, siteUrl).toString();
}

export function formatAreaLabel(area: NailArea): string {
	return capitalize(area);
}

export function formatFacetLinkLabel(page: Pick<NailFacetPage, 'value'>): string {
	return capitalize(page.value);
}

export function formatFacetBreadcrumbLabel(
	page: Pick<NailFacetPage, 'facets'>,
): string {
	return page.facets.map((facet) => capitalize(facet.value)).join(' ');
}

export function buildAreaPageCopy(
	area: NailArea,
	nails: readonly NailRecord[],
): SeoPageCopy {
	const title = `${formatAreaLabel(area)} ideas | Nail.ai`;
	const designs = countLabel(nails.length, `${area} design`, `${area} designs`);
	const details = getAreaDetails(nails);
	const examples = getRecordDescriptions(nails);

	return {
		title,
		description: `Browse ${designs} in the Nail.ai ${area} collection, with ideas organized by color, style, occasion, and season.`,
		heading: `${formatAreaLabel(area)} ideas`,
		prompt: `Show me ${area} nail ideas`,
		paragraphs: [
			[`We found ${designs} in the Nail.ai ${area} collection.`, examples].filter(Boolean).join(' '),
			[details, `Browse the designs below, or describe a color, shape, finish, or occasion in the search above to narrow down your next ${area}.`].filter(Boolean).join(' '),
		],
	};
}

export function buildSiteChromeViewModel(
	allNails: readonly NailRecord[],
	editorial: readonly HubEditorial[],
	navigationGroups: readonly NavigationGroup[],
): SiteChromeViewModel {
	const hubPages = attachHubEditorial(
		nailAreas.flatMap((area) => getFacetPages(allNails, area)),
		editorial,
	);
	const indexableHrefs = new Set(hubPages.filter(isIndexable).map((page) => buildFacetRoute(page.area, page.slug)));

	return {
		header: {
			browseGroups: buildHeaderBrowseGroups(hubPages),
			availableAreas: nailAreas
				.filter((area) => isIndexablePage(getNailsForArea(allNails, area).length))
				.map((area) => ({ label: formatAreaLabel(area), href: buildAreaRoute(area) })),
		},
		footer: {
			groups: buildNavigationGroups(navigationGroups, 'footer', indexableHrefs),
		},
	};
}

function buildHeaderBrowseGroups(pages: readonly NailFacetPage[]): BrowseLinkGroupViewModel[] {
	const indexablePages = pages.filter(isIndexable);

	return headerBrowseGroupDefinitions.flatMap(({ kind, label }) => {
		const matchingPages = indexablePages.filter((page) => page.kind === kind);
		const areasByValue = new Map<string, Set<NailFacetPage['area']>>();

		for (const page of matchingPages) {
			const areas = areasByValue.get(page.value) ?? new Set<NailFacetPage['area']>();
			areas.add(page.area);
			areasByValue.set(page.value, areas);
		}

		const links = matchingPages.map((page) => ({
			label: areasByValue.get(page.value)?.size === 1
				? formatFacetLinkLabel(page)
				: `${formatFacetLinkLabel(page)} ${page.area}`,
			href: buildFacetRoute(page.area, page.slug),
		}));

		return links.length > 0 ? [{ label, links }] : [];
	});
}

export function buildFacetBrowseLinksViewModel(
	pages: readonly NailFacetPage[],
	title: string,
	currentSlug?: string,
	parentFacets?: readonly NailFacetSelection[],
): FacetBrowseLinksViewModel | undefined {
	const indexablePages = pages.filter(isIndexable);
	const includeArea = new Set(indexablePages.map((page) => page.area)).size > 1;
	if (parentFacets) {
		const groups = facetKinds.flatMap((kind) => {
			const definition = browseGroupDefinitions.find((group) => group.kind === kind);
			if (!definition) return [];

			const links = indexablePages
				.filter((page) => page.kind === 'combination'
					&& page.slug !== currentSlug
					&& page.facets.length === parentFacets.length + 1
					&& parentFacets.every((parentFacet) => page.facets.some((facet) =>
						facet.kind === parentFacet.kind && facet.value === parentFacet.value))
					&& page.facets.some((facet) => facet.kind === kind
						&& !parentFacets.some((parentFacet) => parentFacet.kind === facet.kind)))
				.map((page) => ({
					label: formatFacetBreadcrumbLabel(page),
					href: buildFacetRoute(page.area, page.slug),
				}));

			return links.length > 0 ? [{ label: definition.label, links }] : [];
		});

		return groups.length > 0 ? { title, groups } : undefined;
	}

	const groups = facetKinds.flatMap((kind) => {
		const definition = browseGroupDefinitions.find((group) => group.kind === kind);
		if (!definition) return [];

		const links = indexablePages
			.filter((page) => page.kind === kind && page.slug !== currentSlug)
			.map((page) => ({
				label: includeArea ? `${formatFacetLinkLabel(page)} ${page.area}` : formatFacetLinkLabel(page),
				href: buildFacetRoute(page.area, page.slug),
			}));

		return links.length > 0 ? [{ label: definition.label, links }] : [];
	});

	const combinationLinks = indexablePages
		.filter((page) => page.kind === 'combination' && page.slug !== currentSlug)
		.map((page) => ({
			label: formatFacetBreadcrumbLabel(page),
			href: buildFacetRoute(page.area, page.slug),
		}));
	if (combinationLinks.length > 0) {
		groups.push({ label: 'Combinations', links: combinationLinks });
	}

	return groups.length > 0 ? { title, groups } : undefined;
}

export function buildHomepageCategories(
	pages: readonly NailFacetPage[],
): HomepageCategoryViewModel[] {
	return homepageCategoryDefinitions
		.map((category) => ({
			...category,
			pages: pages.filter((page) => isIndexable(page) && category.matches(page)).slice(0, 4),
		}))
		.filter((category) => category.pages.length > 0)
		.map((category) => ({
			title: category.title,
			description: category.description,
			thumbnail: category.pages[0].nails[0],
			links: category.pages.map((page) => ({
				label: formatFacetLinkLabel(page),
				href: buildFacetRoute(page.area, page.slug),
			})),
		}));
}

export function buildHomepageBrowseFeatures(
	nails: readonly NailRecord[],
	categories: readonly HomepageCategoryViewModel[],
): readonly HomepageBrowseFeatureViewModel[] {
	const primaryNail = nails[0];
	if (!primaryNail) {
		throw new Error('Homepage requires at least one nail record.');
	}

	const shapeCategory = categories.find(({ title }) => title === 'Nail shapes');
	const shapeNail = shapeCategory?.thumbnail ?? primaryNail;
	const primaryArea = nailAreas[0];
	const primaryAreaLabel = formatAreaLabel(primaryArea);
	const primaryAreaRoute = buildAreaRoute(primaryArea);

	return [
		{
			title: `${primaryAreaLabel} ideas`,
			description: `Browse the complete ${primaryArea.toLowerCase()} collection.`,
			href: primaryAreaRoute,
			nail: primaryNail,
		},
		{
			title: shapeCategory ? 'Browse by shape' : 'Explore the collection',
			description: shapeCategory
				? 'Compare shapes and find a look that suits your routine.'
				: `Browse ${primaryArea.toLowerCase()} ideas organized by color, shape, style, and occasion.`,
			href: shapeCategory?.links[0]?.href ?? primaryAreaRoute,
			nail: shapeNail,
		},
	] as const;
}

export function buildCollectionStructuredData({
	canonical,
	heading,
	description,
	nails,
	breadcrumbs,
	faq,
}: CollectionStructuredDataInput): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': `${canonical}#collection`,
				name: heading,
				url: canonical,
				description,
				mainEntity: { '@id': `${canonical}#designs` },
				hasPart: { '@id': `${canonical}#gallery` },
			},
			{
				'@type': 'ItemList',
				'@id': `${canonical}#designs`,
				itemListElement: nails.map((nail, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: nail.title,
				})),
			},
			buildImageGalleryStructuredData(canonical, heading, nails),
			{
				'@type': 'BreadcrumbList',
				'@id': `${canonical}#breadcrumb`,
				itemListElement: breadcrumbs.map(({ label, href }, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: label,
					item: href ? buildCanonicalUrl(canonical, href) : canonical,
				})),
			},
			...(faq.length > 0
				? [{
					'@type': 'FAQPage',
					'@id': `${canonical}#faq`,
					mainEntity: faq.map(({ question, answer }) => ({
						'@type': 'Question',
						name: question,
						acceptedAnswer: { '@type': 'Answer', text: answer },
					})),
				}]
				: []),
		],
	};
}

export function buildHomepageStructuredData(
	canonical: string,
	description: string,
	socialImage: string,
	featured: readonly NailRecord[],
	faq: readonly FaqItemViewModel[],
): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${canonical}#website`,
				url: canonical,
				name: 'Nail.ai',
				publisher: { '@id': `${canonical}#organization` },
			},
			{
				'@type': 'Organization',
				'@id': `${canonical}#organization`,
				name: 'Nail.ai',
				url: canonical,
				logo: { '@type': 'ImageObject', url: buildCanonicalUrl(canonical, '/favicon.svg') },
			},
			{
				'@type': 'WebApplication',
				'@id': `${canonical}#app`,
				name: 'Nail.ai',
				url: canonical,
				description,
				applicationCategory: 'LifestyleApplication',
				operatingSystem: 'Any',
				image: socialImage,
				publisher: { '@id': `${canonical}#organization` },
				isPartOf: { '@id': `${canonical}#website` },
				hasPart: { '@id': `${canonical}#gallery` },
			},
			buildImageGalleryStructuredData(canonical, 'Featured nail ideas', featured),
			{
				'@type': 'FAQPage',
				'@id': `${canonical}#faq`,
				mainEntity: faq.map(({ question, answer }) => ({
					'@type': 'Question',
					name: question,
					acceptedAnswer: { '@type': 'Answer', text: answer },
				})),
			},
		],
	};
}

function buildNavigationGroups(
	groups: readonly NavigationGroup[],
	placement: Exclude<NavigationPlacement, 'both'>,
	indexableHrefs: ReadonlySet<string>,
): BrowseLinkGroupViewModel[] {
	return groups.flatMap((group) => {
		if (group.placement !== placement && group.placement !== 'both') return [];

		const links = group.links.filter(({ href }) => indexableHrefs.has(href));
		return links.length > 0 ? [{ label: group.label, links }] : [];
	});
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
