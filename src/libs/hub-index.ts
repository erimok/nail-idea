import type { HubEditorial } from './hub-types';

export const MIN_INDEXABLE = 6;

export function isIndexable(hub: { nails: readonly unknown[]; editorial?: Pick<HubEditorial, 'intro' | 'metaDescription'> }): boolean {
	return hub.nails.length >= MIN_INDEXABLE
		&& Boolean(hub.editorial?.intro.trim())
		&& Boolean(hub.editorial?.metaDescription.trim());
}