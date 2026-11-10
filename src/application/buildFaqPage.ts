import { getAllFacetPages } from '../domain/facet-combinations';
import { matchesFaqHub } from '../domain/faq';
import { isIndexable } from '../domain/indexability';
import { buildFacetRoute, buildFaqIndexRoute, buildFaqMarkdownRoute, buildFaqRoute } from '../domain/routes';
import type { SitePorts } from './ports';
import { publishedFaqs } from './faq-support';
import { attachHubEditorial, buildCanonicalUrl, buildFaqStructuredData, buildSiteChromeViewModel, formatFacetBreadcrumbLabel } from './support';
import type { FaqPageViewModel } from './view-models';

export async function buildFaqPage(ports: SitePorts, slug: string): Promise<FaqPageViewModel> {
	const [faqs, nails, hubs, navigation] = await Promise.all([
		ports.faqRepository.listFaqs(),
		ports.nailRepository.findAllNails(),
		ports.hubRepository.listHubs(),
		ports.siteContentRepository.listNavigationGroups(),
	]);
	const faq = publishedFaqs(faqs).find((entry) => entry.slug === slug);
	if (!faq) throw new Error(`Published FAQ not found: ${slug}`);
	const relatedLinks = attachHubEditorial(getAllFacetPages(nails), hubs)
		.filter((page) => isIndexable(page) && matchesFaqHub(faq, page))
		.sort((a, b) => a.area.localeCompare(b.area) || a.slug.localeCompare(b.slug))
		.slice(0, 10)
		.map((page) => ({ label: `${formatFacetBreadcrumbLabel(page)} ${page.area} ideas`, href: buildFacetRoute(page.area, page.slug) }));
	const canonical = buildCanonicalUrl(ports.siteConfig.siteUrl, buildFaqRoute(slug));
	const breadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'FAQs', href: buildFaqIndexRoute() },
		{ label: faq.question },
	] as const;
	return {
		layout: {
			title: `${faq.question} | nail-idea.com`,
			description: faq.metaDescription,
			canonical,
			markdownAlternate: buildCanonicalUrl(ports.siteConfig.siteUrl, buildFaqMarkdownRoute(slug)),
			structuredData: buildFaqStructuredData(canonical, breadcrumbs, [{ question: faq.question, answer: faq.fullAnswer }]),
			siteChrome: buildSiteChromeViewModel(nails, hubs, navigation),
		},
		heading: faq.question,
		answer: faq.fullAnswer,
		breadcrumbs,
		relatedLinks,
	};
}
