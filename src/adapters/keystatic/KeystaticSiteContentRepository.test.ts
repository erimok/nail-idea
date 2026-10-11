import { fileURLToPath } from 'node:url';
import { runSiteContentRepositoryContract } from '../contracts/siteContentRepository.contract';
import { KeystaticSiteContentRepository } from './KeystaticSiteContentRepository';

const fixtureRootPath = fileURLToPath(new URL('./fixtures/content', import.meta.url));
const expectedFaqs = [
	{ question: 'First FAQ', answer: 'Answer one.' },
	{ question: 'Second FAQ', answer: 'Answer two.' },
] as const;
const expectedNavigationGroups = [
	{
		label: 'Colors',
		placement: 'footer',
		links: [{ label: 'Red', href: '/manicure/red-nails/' }],
	},
	{
		label: 'Shapes',
		placement: 'header',
		links: [{ label: 'Almond', href: '/manicure/almond-nails/' }],
	},
] as const;

runSiteContentRepositoryContract({
	name: 'KeystaticSiteContentRepository',
	createRepository: () => new KeystaticSiteContentRepository({ rootPath: fixtureRootPath }),
	expectedFaqs,
	expectedNavigationGroups,
});
