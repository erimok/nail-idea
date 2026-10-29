import { fileURLToPath } from 'node:url';
import { runHubRepositoryContract } from '../contracts/hubRepository.contract';
import { KeystaticHubRepository } from './KeystaticHubRepository';

const fixtureRootPath = fileURLToPath(new URL('./fixtures/content', import.meta.url));

const expectedHubs = [
	{
		area: 'manicure',
		urlSlug: 'red-nails',
		updatedAt: '2026-10-04T12:00',
		intro: 'Red hub intro.',
		metaDescription: 'Red hub description.',
		sections: [{ heading: 'Choosing a red shade', body: 'Use a reference image to compare undertones.' }],
		faq: [{ question: 'What is a red manicure?', answer: 'A manicure with red polish.' }],
	},
	{
		area: 'pedicure',
		urlSlug: 'nude-nails',
		intro: 'Nude hub intro.',
		metaDescription: 'Nude hub description.',
		sections: [],
		faq: [],
	},
] as const;

runHubRepositoryContract({
	name: 'KeystaticHubRepository',
	createRepository: () => new KeystaticHubRepository({ rootPath: fixtureRootPath }),
	expectedHubs,
});
