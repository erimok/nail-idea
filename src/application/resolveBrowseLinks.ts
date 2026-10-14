import type { NailFacetPage, NailFacetSelection } from '../domain/facet-combinations';
import { buildFacetBrowseLinksViewModel } from './support';
import type { FacetBrowseLinksViewModel } from './view-models';

interface ResolveBrowseLinksParams {
	pages: readonly NailFacetPage[];
	title: string;
	currentSlug?: string;
	parentFacets?: readonly NailFacetSelection[];
}

export function resolveBrowseLinks({
	pages,
	title,
	currentSlug,
	parentFacets,
}: ResolveBrowseLinksParams): FacetBrowseLinksViewModel | undefined {
	return buildFacetBrowseLinksViewModel(pages, title, currentSlug, parentFacets);
}
