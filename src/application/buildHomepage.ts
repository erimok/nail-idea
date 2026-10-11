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
	homepageFaq,
	toSearchRecords,
} from './support';
import type { HomepageViewModel } from './view-models';

export async function buildHomepage({
	nailRepository,
	hubRepository,
	siteConfig,
}: SitePorts): Promise<HomepageViewModel> {
	const [nails, editorial] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
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
			structuredData: buildHomepageStructuredData(canonical, description, socialImage, homepageFaq),
			siteChrome: buildSiteChromeViewModel(nails, editorial),
		},
		nails,
		searchRecords: toSearchRecords(nails),
		featured: nails.slice(0, 9),
		categories,
		faqItems: homepageFaq,
		browseFeatures: buildHomepageBrowseFeatures(nails, categories),
	};
}
