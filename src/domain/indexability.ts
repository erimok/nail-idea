import type { HubEditorial } from './hub-types';

// todo: fix to 6
export const MIN_DESIGNS_FOR_INDEX = 6;

export function isIndexablePage(designCount: number): boolean {
	return designCount >= MIN_DESIGNS_FOR_INDEX;
}

export function isIndexable(hub: { nails: readonly unknown[]; editorial?: Pick<HubEditorial, 'intro' | 'metaDescription'> }): boolean {
	return isIndexablePage(hub.nails.length)
		&& Boolean(hub.editorial?.intro.trim())
		&& Boolean(hub.editorial?.metaDescription.trim());
}
