import { describe, expect, it } from 'vitest';
import type { IAIResponse } from './types';
import { searchNails, type NailRecord } from './nail-search';

const redFrenchPrompt: IAIResponse = {
	colors: ['red'],
	types: ['french'],
	occasions: ['wedding'],
	typesOfNails: 'manicure',
	season: 'spring',
	shape: 'almond',
	length: 'short',
	finishes: ['glossy'],
	nailConcerns: [],
};

function makeNail(overrides: Partial<NailRecord> = {}): NailRecord {
	return {
		slug: 'red-french',
		title: 'Red French',
		image: 'https://images.example/red-french.jpg',
		description: 'A red French manicure.',
		typesOfNails: 'manicure',
		colors: ['red'],
		types: ['french'],
		occasions: ['wedding'],
		season: ['spring'],
		shape: 'almond',
		length: 'short',
		finishes: ['glossy'],
		nailConcerns: [],
		...overrides,
	};
}

describe('searchNails', () => {
	it('does not treat the requested service as a positive match when a design type is specified', () => {
		const frenchManicurePrompt: IAIResponse = {
			colors: [],
			types: ['french'],
			occasions: [],
			typesOfNails: 'manicure',
			finishes: [],
			nailConcerns: [],
		};
		const unrelatedNails = [
			makeNail({ slug: 'burgundy', title: 'Burgundy Shimmer Almonds', types: ['minimalist'] }),
			makeNail({ slug: 'coral', title: 'Glossy Coral Pink Short Rounds', types: ['minimalist'] }),
		];

		expect(searchNails(frenchManicurePrompt, [...unrelatedNails, makeNail()]).map(({ nail }) => nail.slug))
			.toEqual(['red-french']);
	});

	it('ranks the closest CMS nail records first', () => {
		const exactMatch = makeNail();
		const partialMatch = makeNail({
			slug: 'red-floral',
			title: 'Red Floral',
			types: ['floral'],
		});

		const matches = searchNails(redFrenchPrompt, [partialMatch, exactMatch]);

		expect(matches.map(({ nail }) => nail.slug)).toEqual(['red-french', 'red-floral']);
		expect(matches[0].score).toBe(1);
	});

	it('omits records with no matching search attributes', () => {
		const bluePedicure = makeNail({
			slug: 'blue-pedi',
			typesOfNails: 'pedicure',
			colors: ['blue'],
			types: ['ombre'],
			occasions: ['beach vacation'],
			season: ['summer'],
			shape: 'square',
			length: 'long',
			finishes: ['chrome'],
		});

		expect(searchNails(redFrenchPrompt, [bluePedicure])).toEqual([]);
	});

	it('matches a both-service nail for an individual service request', () => {
		const matchingPedicure = makeNail({ typesOfNails: 'both' });

		expect(searchNails(redFrenchPrompt, [matchingPedicure])).toHaveLength(1);
	});
});