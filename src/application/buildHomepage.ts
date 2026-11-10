import { nailAreas } from '../domain/areas';
import { getAllFacetPages, getFacetPages } from '../domain/facet-combinations';
import type { SitePorts } from './ports';
import {
	attachHubEditorial,
	buildCanonicalUrl,
	buildHomepageBrowseFeatures,
	buildHomepageCategories,
	buildHomepageStructuredData,
	buildSearchHubLinks,
	buildSiteChromeViewModel,
	toSearchRecords,
} from './support';
import type { HomepageViewModel } from './view-models';
import { faqSummary, publishedFaqs, validateUniqueFaqQuestions } from './faq-support';

export async function buildHomepage({
	nailRepository,
	hubRepository,
	siteContentRepository,
	siteConfig,
	faqRepository,
}: SitePorts): Promise<HomepageViewModel> {
	const [nails, editorial, legacyFaqItems, navigationGroups, faqs] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		siteContentRepository.listFaqs(),
		siteContentRepository.listNavigationGroups(),
		faqRepository.listFaqs(),
	]);
	const faqItems = [
		...legacyFaqItems.map(({ question, answer, order }, index) => ({ item: { question, answer }, order: order ?? index + 1, key: question })),
		...publishedFaqs(faqs).filter((faq) => faq.homepage).map((faq) => ({ item: faqSummary(faq), order: faq.order, key: faq.slug })),
	].sort((a, b) => a.order - b.order || a.key.localeCompare(b.key)).map(({ item }) => item);
	validateUniqueFaqQuestions(faqItems, 'homepage');
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
			title: 'Manicure Ideas by Color, Shape & Occasion | nail-idea.com',
			description,
			canonical,
			socialImage,
			socialImageAlt: 'AI-generated manicure design with a polished nude finish',
			socialImageDimensions: { width: 1200, height: 630 },
			structuredData: buildHomepageStructuredData(canonical, description, socialImage, nails.slice(0, 9), faqItems),
			siteChrome: buildSiteChromeViewModel(nails, editorial, navigationGroups),
		},
		nails,
		searchRecords: toSearchRecords(nails),
		searchHubLinks: buildSearchHubLinks(attachHubEditorial(getAllFacetPages(nails), editorial)),
		featured: nails.slice(0, 9),
		categories,
		faqItems,
		browseFeatures: buildHomepageBrowseFeatures(nails, categories),
	};
}
