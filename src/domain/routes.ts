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

export function buildFaqRoute(slug: string): string {
	return `/faq/${slug}/`;
}

export function buildFaqIndexRoute(): string {
	return '/faq/';
}

export function buildFaqMarkdownRoute(slug: string): string {
	return `/faq/${slug}.md`;
}
