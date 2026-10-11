import { runHubRepositoryContract } from '../contracts/hubRepository.contract';
import { InMemoryHubRepository } from './InMemoryHubRepository';
import { aHub } from '../../test/builders';

const expectedHubs = [
	aHub({
		area: 'manicure',
		urlSlug: 'red-nails',
		intro: 'Red hub intro.',
		metaDescription: 'Red hub description.',
		faq: [{ question: 'What is red?', answer: 'A bold classic.' }],
	}),
	aHub({
		area: 'pedicure',
		urlSlug: 'nude-nails',
		intro: 'Nude hub intro.',
		metaDescription: 'Nude hub description.',
		faq: [],
	}),
] as const;

runHubRepositoryContract({
	name: 'InMemoryHubRepository',
	createRepository: () => new InMemoryHubRepository(expectedHubs),
	expectedHubs,
});
