import type { NailRecord } from '../nail';

function seasonValues(value: NailRecord['season']): readonly string[] {
	if (value === undefined) return [];
	if (typeof value === 'string') return [value];
	return [...value];
}

const facetDefinitions = [
	{ name: 'color', combinable: true, combinationOrder: 3, getValues: (nail: NailRecord) => nail.colors },
	{ name: 'type', combinable: true, combinationOrder: 4, getValues: (nail: NailRecord) => nail.types },
	{ name: 'occasion', combinable: false, getValues: (nail: NailRecord) => nail.occasions },
	{ name: 'season', combinable: false, getValues: (nail: NailRecord) => seasonValues(nail.season) },
	{ name: 'shape', combinable: true, combinationOrder: 5, getValues: (nail: NailRecord) => nail.shape ? [nail.shape] : [] },
	{ name: 'length', combinable: true, combinationOrder: 1, getValues: (nail: NailRecord) => nail.length ? [nail.length] : [] },
	{ name: 'finishing', combinable: true, combinationOrder: 2, getValues: (nail: NailRecord) => nail.finishes },
] as const;

type FacetDefinition = (typeof facetDefinitions)[number];
type CombinableFacetDefinition = Extract<FacetDefinition, { combinable: true }>;

export type FacetKind = FacetDefinition['name'];
export type CombinableFacetKind = CombinableFacetDefinition['name'];
type FacetRegistryEntry = { name: FacetKind; combinable: boolean };

export const facetRegistry = facetDefinitions.map(({ name, combinable }) => ({ name, combinable })) as ReadonlyArray<FacetRegistryEntry>;

// The facet kind that defines a design's core style; its hub is the parent of combination hubs.
export const coreStyleFacetKind: FacetKind = 'type';

export const facetKinds = facetDefinitions.map(({ name }) => name) as readonly FacetKind[];
export const combinableFacetKinds = [...facetDefinitions]
	.filter((definition): definition is CombinableFacetDefinition => definition.combinable)
	.sort((left, right) => left.combinationOrder - right.combinationOrder)
	.map(({ name }) => name) as readonly CombinableFacetKind[];

const facetValueReaders = Object.fromEntries(
	facetDefinitions.map(({ name, getValues }) => [name, getValues]),
) as Record<FacetKind, (nail: NailRecord) => readonly string[]>;

export function getFacetValues(nail: NailRecord, kind: FacetKind): readonly string[] {
	return facetValueReaders[kind](nail);
}
