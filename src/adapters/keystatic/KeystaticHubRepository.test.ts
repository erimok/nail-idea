import { fileURLToPath } from 'node:url';
import { runHubRepositoryContract } from '../contracts/hubRepository.contract';
import { KeystaticHubRepository } from './KeystaticHubRepository';

const fixtureRootPath = fileURLToPath(new URL('./fixtures/content', import.meta.url));

const expectedHubs = [
	{
		area: 'manicure',
		urlSlug: 'red-nails',
		intro: 'Red hub intro.',
		metaDescription: 'Red hub description.',
		faq: [{ question: 'What is a red manicure?', answer: 'A manicure with red polish.' }],
	},
	{
		area: 'pedicure',
		urlSlug: 'nude-nails',
		intro: 'Nude hub intro.',
		metaDescription: 'Nude hub description.',
		faq: [],
	},
] as const;

runHubRepositoryContract({
	name: 'KeystaticHubRepository',
	createRepository: () => new KeystaticHubRepository({ rootPath: fixtureRootPath }),
	expectedHubs,
});
