import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import type { NailFacetPage } from '../domain/facet-combinations';
import type { HubEditorial } from '../domain/hub-types';

export async function loadHubEditorial(): Promise<HubEditorial[]> {
	const reader = createReader(process.cwd(), keystaticConfig);
	const entries = await reader.collections.hubs.all();
	return entries.map(({ entry }) => ({
		area: entry.area,
		urlSlug: entry.urlSlug,
		intro: entry.intro.trim(),
		metaDescription: entry.metaDescription.trim(),
		faq: entry.faq,
	}));
}

export function attachHubEditorial(pages: readonly NailFacetPage[], entries: readonly HubEditorial[]): NailFacetPage[] {
	return pages.map((page) => ({
		...page,
		editorial: entries.find((entry) => entry.area === page.area && entry.urlSlug === page.slug),
	}));
}