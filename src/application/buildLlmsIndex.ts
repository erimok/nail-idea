import { nailAreas } from '../domain/areas';
import { buildFacetMarkdownRoute, buildFaqMarkdownRoute } from '../domain/routes';
import { publishedFaqs } from './faq-support';
import type { SitePorts } from './ports';
import type { LlmsIndexViewModel } from './view-models';
import { buildCanonicalUrl } from './support';
import { buildHubPage } from './buildHubPage';
import { listHubRoutes } from './listHubRoutes';

export async function buildLlmsIndex(ports: SitePorts): Promise<LlmsIndexViewModel> {
	const { indexableHubRoutes } = await listHubRoutes(ports);
	const pages = await Promise.all(indexableHubRoutes.map(async (route) => {
		const page = await buildHubPage(ports, route);
		return {
			area: route.area,
			title: page.heading,
			description: page.layout.description,
			markdownUrl: buildCanonicalUrl(
				ports.siteConfig.siteUrl,
				buildFacetMarkdownRoute(route.area, route.slug),
			),
		};
	}));

	return {
		faqs: publishedFaqs(await ports.faqRepository.listFaqs()).map((faq) => ({
			title: faq.question,
			description: faq.metaDescription,
			markdownUrl: buildCanonicalUrl(ports.siteConfig.siteUrl, buildFaqMarkdownRoute(faq.slug)),
		})),
		areas: nailAreas.flatMap((area) => {
			const areaPages = pages
				.filter((page) => page.area === area)
				.map(({ title, description, markdownUrl }) => ({ title, description, markdownUrl }));
			return areaPages.length > 0 ? [{ area, pages: areaPages }] : [];
		}),
	};
}
