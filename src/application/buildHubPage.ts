import { getAllFacetPages, getFacetPages, type NailFacetPage } from '../domain/facet-combinations';
import { isIndexable } from '../domain/indexability';
import { buildAreaRoute, buildFacetRoute } from '../domain/routes';
import type { SitePorts } from './ports';
import {
	attachHubEditorial,
	buildCanonicalUrl,
	buildCollectionStructuredData,
	buildHubPageCopy,
	buildSiteChromeViewModel,
	formatAreaLabel,
	formatFacetBreadcrumbLabel,
	toSearchRecords,
} from './support';
import { resolveBrowseLinks } from './resolveBrowseLinks';
import type { CollectionPageViewModel } from './view-models';

interface BuildHubPageParams {
	area: 'manicure' | 'pedicure';
	slug: string;
}

export async function buildHubPage(
	{ nailRepository, hubRepository, siteConfig }: SitePorts,
	{ area, slug }: BuildHubPageParams,
): Promise<CollectionPageViewModel> {
	const [allNails, editorial] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
	]);
	const pages = attachHubEditorial(getAllFacetPages(allNails), editorial);
	const page = pages.find((candidate) => candidate.area === area && candidate.slug === slug);

	if (!page) {
		throw new Error(`Hub page not found for /${area}/${slug}/.`);
	}

	const copy = buildHubPageCopy(page);
	const canonical = buildCanonicalUrl(siteConfig.siteUrl, buildFacetRoute(area, slug));
	const facetLabel = formatFacetBreadcrumbLabel(page);
	const relatedPages = attachHubEditorial(getFacetPages(allNails, area), editorial);
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
			siteChrome: buildSiteChromeViewModel(allNails, editorial),
		},
		heading: copy.heading,
		prompt: copy.prompt,
		paragraphs: copy.paragraphs,
		designs: page.nails,
		searchRecords: toSearchRecords(page.nails),
		breadcrumbs,
		relatedLinks: relatedPages.length > 0
			? resolveBrowseLinks({ pages: relatedPages as readonly NailFacetPage[], title: `Explore more ${area} ideas`, currentSlug: slug })
			: undefined,
		sectionTitle: `${page.nails.length} ${facetLabel.toLowerCase()} designs`,
		faq: page.editorial?.faq ?? [],
		emptyStateMessage: `New ${area} ideas are coming soon.`,
	};
}
