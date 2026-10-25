import { nailAreas } from '../../domain/areas';
import type { NailFacetSelection } from '../../domain/facet-combinations';
import { findBestHubForSearch, type SearchHubLink } from '../../domain/search-hub-match';
import type { IAIResponse } from './types';

export function toSearchFacets(response: IAIResponse): NailFacetSelection[] {
	return [
		...response.colors.map((value) => ({ kind: 'color' as const, value })),
		...response.types.map((value) => ({ kind: 'type' as const, value })),
		...(response.occasions ?? []).map((value) => ({ kind: 'occasion' as const, value })),
		...(response.season ? [{ kind: 'season' as const, value: response.season }] : []),
		...(response.shape ? [{ kind: 'shape' as const, value: response.shape }] : []),
		...(response.length ? [{ kind: 'length' as const, value: response.length }] : []),
		...(response.finishes ?? []).map((value) => ({ kind: 'finishing' as const, value })),
	];
}

export function findHubForSearch(
	response: IAIResponse,
	hubs: readonly SearchHubLink[],
): SearchHubLink | undefined {
	const facets = toSearchFacets(response);
	const areas = response.typesOfNails === 'both' ? nailAreas : [response.typesOfNails];

	return areas
		.map((area) => findBestHubForSearch({ area, facets }, hubs))
		.filter((hub): hub is SearchHubLink => hub !== undefined)
		.sort((left, right) => right.facets.length - left.facets.length || right.designCount - left.designCount)[0];
}
