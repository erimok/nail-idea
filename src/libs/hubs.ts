import type { NailFacetPage } from '../domain/facet-combinations';
import type { HubEditorial } from '../domain/hub-types';
import { KeystaticHubRepository } from '../adapters/keystatic/KeystaticHubRepository';

const repository = new KeystaticHubRepository();

export async function loadHubEditorial(): Promise<HubEditorial[]> {
	// TODO: remove wrapper in composition phase.
	return [...await repository.listHubs()];
}

export function attachHubEditorial(pages: readonly NailFacetPage[], entries: readonly HubEditorial[]): NailFacetPage[] {
	return pages.map((page) => ({
		...page,
		editorial: entries.find((entry) => entry.area === page.area && entry.urlSlug === page.slug),
	}));
}
