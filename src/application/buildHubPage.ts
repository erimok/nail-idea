import {
	findCoreStyleParentPage,
	findFirstFacetParentPage,
	getAllFacetPages,
	isDirectSubpageOfFacetPage,
} from '../domain/facet-combinations';
import type { NailArea } from '../domain/areas';
import { formatHubAnchorLabel, generateHubCopy } from '../domain/hub-copy';
import { INITIAL_DESIGN_COUNT, splitDesigns } from '../domain/gallery';
import { isIndexable } from '../domain/indexability';
import { buildAreaRoute, buildFacetMarkdownRoute, buildFacetRoute } from '../domain/routes';
import type { SitePorts } from './ports';
import {
	attachHubEditorial,
	buildCanonicalUrl,
	buildCollectionStructuredData,
	buildSiteChromeViewModel,
	formatAreaLabel,
	formatFacetBreadcrumbLabel,
	toSearchRecords,
} from './support';
import { resolveBrowseLinks } from './resolveBrowseLinks';
import type { CollectionPageViewModel } from './view-models';

const DEFAULT_SOCIAL_IMAGE_PATH = '/og/home.jpg';

interface BuildHubPageParams {
	area: NailArea;
	slug: string;
}

export async function buildHubPage(
	{ nailRepository, hubRepository, siteContentRepository, siteConfig }: SitePorts,
	{ area, slug }: BuildHubPageParams,
): Promise<CollectionPageViewModel> {
	const [allNails, editorial, navigationGroups] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		siteContentRepository.listNavigationGroups(),
	]);
	const pages = attachHubEditorial(getAllFacetPages(allNails), editorial);
	const page = pages.find((candidate) => candidate.area === area && candidate.slug === slug);

	if (!page) {
		throw new Error(`Hub page not found for /${area}/${slug}/.`);
	}

	const relatedPages = pages.filter((candidate) => candidate.area === area);
	const copy = generateHubCopy(page, relatedPages.filter(isIndexable), siteConfig.currentYear);
	const pageNailSlugs = new Set(page.nails.map((nail) => nail.slug));
	const canonical = buildCanonicalUrl(siteConfig.siteUrl, buildFacetRoute(area, slug));
	const facetLabel = formatFacetBreadcrumbLabel(page);
	const socialImage = page.nails[0]?.imageSrc || page.nails[0]?.image;
	const coreStyleParent = findCoreStyleParentPage(page, pages);
	const breadcrumbParent = findFirstFacetParentPage(page, pages);
	const breadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: formatAreaLabel(area), href: buildAreaRoute(area) },
		...(breadcrumbParent
			? [{ label: formatFacetBreadcrumbLabel(breadcrumbParent), href: buildFacetRoute(area, breadcrumbParent.slug) }]
			: []),
		{ label: facetLabel },
	];

	return {
		layout: {
			title: copy.title,
			description: copy.description,
			canonical,
			markdownAlternate: isIndexable(page)
				? buildCanonicalUrl(siteConfig.siteUrl, buildFacetMarkdownRoute(area, slug))
				: undefined,
			noIndex: !isIndexable(page),
			socialImage: buildCanonicalUrl(siteConfig.siteUrl, socialImage || DEFAULT_SOCIAL_IMAGE_PATH),
			socialImageAlt: page.nails[0]?.imageAlt ?? `${copy.heading} on nail-idea.com`,
			structuredData: buildCollectionStructuredData({
				canonical,
				heading: copy.heading,
				description: copy.description,
				nails: page.nails,
				breadcrumbs,
				faq: page.editorial?.faq ?? [],
			}),
			siteChrome: buildSiteChromeViewModel(allNails, editorial, navigationGroups),
		},
		heading: copy.heading,
		prompt: `${page.value} ${area} ideas`,
		paragraphs: [],
		intro: copy.intro,
		editorialSections: page.editorial?.sections ?? [],
		designs: page.nails,
		designGrid: splitDesigns(page.nails, INITIAL_DESIGN_COUNT),
		searchRecords: toSearchRecords(page.nails),
		breadcrumbs,
		relatedLinks: relatedPages.length > 0
			? resolveBrowseLinks({
				pages: relatedPages.filter((candidate) => candidate.nails.some((nail) => pageNailSlugs.has(nail.slug))
					&& isDirectSubpageOfFacetPage(page, candidate)),
				title: `Explore more ${area} ideas`,
				currentSlug: slug,
				parentFacets: page.facets,
			})
			: undefined,
		coreStyleLink: coreStyleParent
			? {
				label: formatHubAnchorLabel(coreStyleParent),
				href: buildFacetRoute(area, coreStyleParent.slug),
				designCount: coreStyleParent.nails.length,
			}
			: undefined,
		sectionTitle: `${page.nails.length} ${facetLabel} designs`,
		faq: page.editorial?.faq ?? [],
		emptyStateMessage: `New ${area} ideas are coming soon.`,
	};
}
