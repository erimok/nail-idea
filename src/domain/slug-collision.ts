import type { NailArea } from './areas';

export class SlugCollisionError extends Error {
	constructor(
		readonly area: NailArea,
		readonly slug: string,
		message: string,
	) {
		super(message);
		this.name = 'SlugCollisionError';
	}
}

export function createFacetSlugCollisionError(
	area: NailArea,
	slug: string,
	previous: string,
	next: string,
): SlugCollisionError {
	return new SlugCollisionError(
		area,
		slug,
		`Facet URL conflict for /${area}/${slug}/: ${previous} and ${next}.`,
	);
}

export function createCombinationSlugCollisionError(area: NailArea, slug: string): SlugCollisionError {
	return new SlugCollisionError(
		area,
		slug,
		`Facet URL conflict for /${area}/${slug}/: multiple facet combinations normalize to the same slug.`,
	);
}
