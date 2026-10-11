import { getFacetPages, getNailsForArea } from '../domain/facet-combinations';
import { isIndexablePage } from '../domain/indexability';
import { buildAreaRoute } from '../domain/routes';
import type { SitePorts } from './ports';
import {
	attachHubEditorial,
	buildAreaPageCopy,
	buildCanonicalUrl,
	buildCollectionStructuredData,
	buildSiteChromeViewModel,
	formatAreaLabel,
	toSearchRecords,
} from './support';
import { resolveBrowseLinks } from './resolveBrowseLinks';
import type { CollectionPageViewModel } from './view-models';

interface BuildAreaPageParams {
	area: 'manicure' | 'pedicure';
}

export async function buildAreaPage(
	{ nailRepository, hubRepository, siteConfig }: SitePorts,
	{ area }: BuildAreaPageParams,
): Promise<CollectionPageViewModel> {
	const [allNails, editorial] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
	]);
	const designs = getNailsForArea(allNails, area);
	const relatedPages = attachHubEditorial(getFacetPages(allNails, area), editorial);
	const copy = buildAreaPageCopy(area, designs);
	const canonical = buildCanonicalUrl(siteConfig.siteUrl, buildAreaRoute(area));
	const breadcrumbs = [{ label: 'Home', href: '/' }, { label: formatAreaLabel(area) }] as const;

	return {
		layout: {
			title: copy.title,
			description: copy.description,
			canonical,
			noIndex: !isIndexablePage(designs.length),
			structuredData: buildCollectionStructuredData({
				canonical,
				heading: copy.heading,
				description: copy.description,
				nails: designs,
				breadcrumbs,
				faq: [],
			}),
			siteChrome: buildSiteChromeViewModel(allNails, editorial),
		},
		heading: copy.heading,
		prompt: copy.prompt,
		paragraphs: copy.paragraphs,
		designs,
		searchRecords: toSearchRecords(designs),
		breadcrumbs,
		relatedLinks: relatedPages.length > 0
			? resolveBrowseLinks({ pages: relatedPages, title: `Explore more ${area} ideas` })
			: undefined,
		sectionTitle: `All ${area} ideas`,
		faq: [],
		emptyStateMessage: `New ${area} ideas are coming soon.`,
	};
}
