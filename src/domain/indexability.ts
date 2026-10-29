export const MIN_DESIGNS_FOR_INDEX = 6;

export function isIndexablePage(designCount: number): boolean {
	return designCount >= MIN_DESIGNS_FOR_INDEX;
}

export function isIndexable(hub: {
	nails: readonly unknown[];
	editorial?: { intro: string; metaDescription: string };
}): boolean {
	return isIndexablePage(hub.nails.length)
		&& hub.editorial !== undefined
		&& Boolean(hub.editorial.intro.trim())
		&& Boolean(hub.editorial.metaDescription.trim());
}
