import { getAllFacetPages, getFacetPages } from '../domain/facet-combinations';
import type { NailArea } from '../domain/areas';
import { generateHubCopy } from '../domain/hub-copy';
import { isIndexable } from '../domain/indexability';
import { buildAreaRoute, buildFacetRoute } from '../domain/routes';
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

	const relatedPages = attachHubEditorial(getFacetPages(allNails, area), editorial);
	const copy = generateHubCopy(page, relatedPages.filter(isIndexable));
	const pageNailSlugs = new Set(page.nails.map((nail) => nail.slug));
	const canonical = buildCanonicalUrl(siteConfig.siteUrl, buildFacetRoute(area, slug));
	const facetLabel = formatFacetBreadcrumbLabel(page);
	const breadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: formatAreaLabel(area), href: buildAreaRoute(area) },
		{ label: facetLabel },
	] as const;

	return {
		layout: {
			title: copy.title,
			description: copy.description,
			canonical,
			noIndex: !isIndexable(page),
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
		designs: page.nails,
		searchRecords: toSearchRecords(page.nails),
		breadcrumbs,
		relatedLinks: relatedPages.length > 0
			? resolveBrowseLinks({
				pages: relatedPages.filter((candidate) => candidate.nails.some((nail) => pageNailSlugs.has(nail.slug))),
				title: `Explore more ${area} ideas`,
				currentSlug: slug,
			})
			: undefined,
		sectionTitle: `${page.nails.length} ${facetLabel.toLowerCase()} designs`,
		faq: page.editorial?.faq ?? [],
		emptyStateMessage: `New ${area} ideas are coming soon.`,
	};
}
