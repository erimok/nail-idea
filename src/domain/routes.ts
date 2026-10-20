import type { NailArea } from './areas';

export function buildAreaRoute(area: NailArea): string {
	return `/${area}/`;
}

export function buildFacetRoute(area: NailArea, slug: string): string {
	return `${buildAreaRoute(area)}${slug}/`;
}

export function buildFacetMarkdownRoute(area: NailArea, slug: string): string {
	return `${buildAreaRoute(area)}${slug}.md`;
}
