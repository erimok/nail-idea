import { getAllFacetPages } from '../domain/facet-combinations';
import { nailAreas } from '../domain/areas';
import { isIndexable } from '../domain/indexability';
import type { ContentPorts } from './ports';
import type { HubRouteListing } from './view-models';
import { attachHubEditorial } from './support';

export async function listHubRoutes({
	nailRepository,
	hubRepository,
}: ContentPorts): Promise<HubRouteListing> {
	const [nails, editorial] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
	]);
	const pages = getAllFacetPages(nails);
	const pagesWithEditorial = attachHubEditorial(pages, editorial);

	return {
		areaRoutes: nailAreas.map((area) => ({ area })),
		hubRoutes: pages.map((page) => ({ area: page.area, slug: page.slug })),
		indexableHubRoutes: pagesWithEditorial
			.filter(isIndexable)
			.map((page) => ({ area: page.area, slug: page.slug })),
	};
}
