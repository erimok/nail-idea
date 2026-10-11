export const MIN_DESIGNS_FOR_INDEX = 6;

export function isIndexablePage(designCount: number): boolean {
	return designCount >= MIN_DESIGNS_FOR_INDEX;
}

export function isIndexable(hub: { nails: readonly unknown[] }): boolean {
	return isIndexablePage(hub.nails.length);
}
