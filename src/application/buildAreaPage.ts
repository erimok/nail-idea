import { getAllFacetPages, getNailsForArea } from '../domain/facet-combinations';
import type { NailArea } from '../domain/areas';
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

const areaBrowseFacetKinds: readonly string[] = ['color', 'type', 'occasion', 'season', 'length', 'finishing'];

interface BuildAreaPageParams {
	area: NailArea;
}

export async function buildAreaPage(
	{ nailRepository, hubRepository, siteContentRepository, siteConfig }: SitePorts,
	{ area }: BuildAreaPageParams,
): Promise<CollectionPageViewModel> {
	const [allNails, editorial, navigationGroups] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		siteContentRepository.listNavigationGroups(),
	]);
	const designs = getNailsForArea(allNails, area);
	const relatedPages = attachHubEditorial(
		getAllFacetPages(allNails).filter((page) => page.area === area),
		editorial,
	);
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
			siteChrome: buildSiteChromeViewModel(allNails, editorial, navigationGroups),
		},
		heading: copy.heading,
		prompt: copy.prompt,
		paragraphs: copy.paragraphs,
		designs,
		searchRecords: toSearchRecords(designs),
		breadcrumbs,
		relatedLinks: resolveBrowseLinks({
			pages: relatedPages.filter((page) => areaBrowseFacetKinds.includes(page.kind)),
			title: 'You may like',
		}),
		sectionTitle: `All ${area} ideas`,
		faq: [],
		emptyStateMessage: `New ${area} ideas are coming soon.`,
	};
}
