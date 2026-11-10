import type { FacetKind } from '../../domain/facets/registry';
import { aiSearchOptions } from './vocabulary';

export const faqFacetOptions = {
	colors: { kind: 'color', values: aiSearchOptions.colors },
	types: { kind: 'type', values: aiSearchOptions.types },
	occasions: { kind: 'occasion', values: aiSearchOptions.occasions },
	seasons: { kind: 'season', values: aiSearchOptions.seasons },
	shapes: { kind: 'shape', values: aiSearchOptions.shapes },
	lengths: { kind: 'length', values: aiSearchOptions.lengths },
	finishes: { kind: 'finishing', values: aiSearchOptions.finishes },
} satisfies Record<string, { kind: FacetKind; values: readonly string[] }>;

export function isKnownFaqFacet(kind: FacetKind, value: string): boolean {
	return Object.values(faqFacetOptions).some((option) => option.kind === kind && option.values.includes(value));
}
