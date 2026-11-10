import { nailAreas } from '../domain/areas';
import { getAllFacetPages, getNailsForArea } from '../domain/facet-combinations';
import { isIndexable, isIndexablePage } from '../domain/indexability';
import { buildAreaRoute, buildFacetRoute } from '../domain/routes';
import { buildFaqIndexRoute, buildFaqRoute } from '../domain/routes';
import type { FaqRepository } from '../ports/FaqRepository';
import { hubFaqs, publishedFaqs, validateFaqPlacements } from './faq-support';
import type { ContentPorts } from './ports';
import { attachHubEditorial } from './support';

export interface SitemapRoute {
	url: string;
	lastmod?: string;
}

function latestContentDate(records: readonly { updatedAt?: string }[]): string | undefined {
	const dates = records
		.map(({ updatedAt }) => updatedAt?.slice(0, 10))
		.filter((date): date is string => date !== undefined);

	return dates.sort().at(-1);
}

export async function resolveSitemapRoutes({
	nailRepository,
	hubRepository,
	faqRepository,
}: ContentPorts & { faqRepository: FaqRepository }): Promise<readonly SitemapRoute[]> {
	const [nails, editorial, faqs] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		faqRepository.listFaqs(),
	]);
	const pages = attachHubEditorial(getAllFacetPages(nails), editorial);
	validateFaqPlacements(faqs, pages);
	const published = publishedFaqs(faqs);
	const homepageFaqs = published.filter((faq) => faq.homepage);

	return [
		{ url: '/', lastmod: homepageFaqs.some((faq) => !faq.updatedAt) ? undefined : latestContentDate([...nails, ...homepageFaqs]) },
		{ url: '/about/' },
		{ url: '/terms/' },
		{ url: '/privacy-policy/' },
		...nailAreas.flatMap((area) => {
			const areaNails = getNailsForArea(nails, area);
			return isIndexablePage(areaNails.length) ? [{
				url: buildAreaRoute(area),
				lastmod: latestContentDate(areaNails),
			}] : [];
		}),
		...pages
			.filter(isIndexable)
			.map((page) => {
				const relatedFaqs = hubFaqs(published, page);
				return {
					url: buildFacetRoute(page.area, page.slug),
					lastmod: relatedFaqs.some((faq) => !faq.updatedAt) ? undefined : latestContentDate([
						...page.nails,
						...(page.editorial ? [page.editorial] : []),
						...relatedFaqs,
					]),
				};
			}),
		...published.map((faq) => ({ url: buildFaqRoute(faq.slug), lastmod: latestContentDate([faq]) })),
		...(published.length > 0 ? [{ url: buildFaqIndexRoute() }] : []),
	];
}
