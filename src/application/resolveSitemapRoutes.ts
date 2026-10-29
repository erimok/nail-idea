import { nailAreas } from '../domain/areas';
import { getAllFacetPages, getNailsForArea } from '../domain/facet-combinations';
import { isIndexable, isIndexablePage } from '../domain/indexability';
import { buildAreaRoute, buildFacetRoute } from '../domain/routes';
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
}: ContentPorts): Promise<readonly SitemapRoute[]> {
	const [nails, editorial] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
	]);

	return [
		{ url: '/', lastmod: latestContentDate(nails) },
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
		...attachHubEditorial(getAllFacetPages(nails), editorial)
			.filter(isIndexable)
			.map((page) => ({
				url: buildFacetRoute(page.area, page.slug),
				lastmod: latestContentDate([
					...page.nails,
					...(page.editorial ? [page.editorial] : []),
				]),
			})),
	];
}
