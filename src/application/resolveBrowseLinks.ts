import type { NailFacetPage } from '../domain/facet-combinations';
import { buildFacetBrowseLinksViewModel } from './support';
import type { FacetBrowseLinksViewModel } from './view-models';

interface ResolveBrowseLinksParams {
	pages: readonly NailFacetPage[];
	title: string;
	currentSlug?: string;
}

export function resolveBrowseLinks({
	pages,
	title,
	currentSlug,
}: ResolveBrowseLinksParams): FacetBrowseLinksViewModel | undefined {
	return buildFacetBrowseLinksViewModel(pages, title, currentSlug);
}
