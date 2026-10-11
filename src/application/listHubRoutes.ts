import { getAllFacetPages } from '../domain/facet-combinations';
import { nailAreas } from '../domain/areas';
import type { ContentPorts } from './ports';
import type { HubRouteListing } from './view-models';

export async function listHubRoutes({
	nailRepository,
}: ContentPorts): Promise<HubRouteListing> {
	const nails = await nailRepository.findAllNails();
	const pages = getAllFacetPages(nails);

	return {
		areaRoutes: nailAreas.map((area) => ({ area })),
		hubRoutes: pages.map((page) => ({ area: page.area, slug: page.slug })),
	};
}
