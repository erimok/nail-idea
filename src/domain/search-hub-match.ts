import type { NailArea } from './areas';
import type { NailFacetSelection } from './facet-combinations';

export interface SearchHubLink {
	area: NailArea;
	facets: readonly NailFacetSelection[];
	href: string;
	label: string;
	designCount: number;
}

export interface SearchFacetQuery {
	area: NailArea;
	facets: readonly NailFacetSelection[];
}

function coversAllFacets(query: SearchFacetQuery, hub: SearchHubLink): boolean {
	return hub.facets.every((hubFacet) => query.facets.some((facet) =>
		facet.kind === hubFacet.kind && facet.value === hubFacet.value));
}

/**
 * Picks the most specific hub whose facets are all part of the search.
 * Ties go to the hub with more designs, then to the lower href for a stable result.
 */
export function findBestHubForSearch(
	query: SearchFacetQuery,
	hubs: readonly SearchHubLink[],
): SearchHubLink | undefined {
	return hubs
		.filter((hub) => hub.area === query.area && hub.facets.length > 0 && coversAllFacets(query, hub))
		.sort((left, right) => right.facets.length - left.facets.length
			|| right.designCount - left.designCount
			|| left.href.localeCompare(right.href))[0];
}
