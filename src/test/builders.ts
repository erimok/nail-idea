import type { NailRecord } from '../libs/ai/nail-search';
import type { HubEditorial } from '../domain/hub-types';

let nailSequence = 0;
let hubSequence = 0;

export function aNail(overrides: Partial<NailRecord> = {}): NailRecord {
	nailSequence += 1;

	return {
		slug: `nail-${nailSequence}`,
		title: `Sample nail ${nailSequence}`,
		image: '',
		description: 'Sample nail description.',
		colors: [],
		types: [],
		occasions: [],
		typesOfNails: 'manicure',
		season: undefined,
		shape: undefined,
		length: undefined,
		finishes: [],
		nailConcerns: [],
		...overrides,
	};
}

export function aHub(overrides: Partial<HubEditorial> = {}): HubEditorial {
	hubSequence += 1;

	return {
		area: 'manicure',
		urlSlug: `hub-${hubSequence}`,
		intro: 'Curated hub intro.',
		metaDescription: 'Curated hub description.',
		faq: [],
		...overrides,
	};
}
