import { nailAreas } from '../domain/areas';
import { getAllFacetPages, getNailsForArea } from '../domain/facet-combinations';
import { isIndexable, isIndexablePage } from '../domain/indexability';
import { buildAreaRoute, buildFacetRoute } from '../domain/routes';
import type { ContentPorts } from './ports';
import { attachHubEditorial } from './support';

export async function resolveSitemapRoutes({
	nailRepository,
	hubRepository,
}: ContentPorts): Promise<readonly string[]> {
	const [nails, editorial] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
	]);

	return [
		'/',
		'/about/',
		...nailAreas.flatMap((area) => {
			const areaNails = getNailsForArea(nails, area);
			return isIndexablePage(areaNails.length) ? [buildAreaRoute(area)] : [];
		}),
		...attachHubEditorial(getAllFacetPages(nails), editorial)
			.filter(isIndexable)
			.map((page) => buildFacetRoute(page.area, page.slug)),
	];
}
