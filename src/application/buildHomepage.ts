import { nailAreas } from '../domain/areas';
import { getFacetPages } from '../domain/facet-combinations';
import type { SitePorts } from './ports';
import {
	attachHubEditorial,
	buildCanonicalUrl,
	buildHomepageBrowseFeatures,
	buildHomepageCategories,
	buildHomepageStructuredData,
	buildSiteChromeViewModel,
	toSearchRecords,
} from './support';
import type { HomepageViewModel } from './view-models';

export async function buildHomepage({
	nailRepository,
	hubRepository,
	siteContentRepository,
	siteConfig,
}: SitePorts): Promise<HomepageViewModel> {
	const [nails, editorial, faqItems, navigationGroups] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		siteContentRepository.listFaqs(),
		siteContentRepository.listNavigationGroups(),
	]);
	const facetPages = attachHubEditorial(
		nailAreas.flatMap((area) => getFacetPages(nails, area)),
		editorial,
	);
	const categories = buildHomepageCategories(facetPages);
	const canonical = buildCanonicalUrl(siteConfig.siteUrl, '/');
	const description = 'Browse manicure ideas by color, shape, and occasion, or describe your look and get matching nail designs.';
	const socialImage = buildCanonicalUrl(siteConfig.siteUrl, '/og/home.jpg');

	return {
		layout: {
			title: 'Manicure Ideas by Color, Shape & Occasion | Nail.ai',
			description,
			canonical,
			socialImage,
			socialImageAlt: 'AI-generated manicure design with a polished nude finish',
			structuredData: buildHomepageStructuredData(canonical, description, socialImage, nails.slice(0, 9), faqItems),
			siteChrome: buildSiteChromeViewModel(nails, editorial, navigationGroups),
		},
		nails,
		searchRecords: toSearchRecords(nails),
		featured: nails.slice(0, 9),
		categories,
		faqItems,
		browseFeatures: buildHomepageBrowseFeatures(nails, categories),
	};
}
