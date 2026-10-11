import { runSiteContentRepositoryContract } from '../contracts/siteContentRepository.contract';
import { InMemorySiteContentRepository } from './InMemorySiteContentRepository';

const expectedFaqs = [
	{ question: 'What is a micro French?', answer: 'A thin French tip.' },
	{ question: 'How long does polish last?', answer: 'It depends on the polish.' },
] as const;

const expectedNavigationGroups = [
	{
		label: 'Colors',
		placement: 'both',
		links: [{ label: 'Nude', href: '/manicure/nude-nails/' }],
	},
	{
		label: 'Shapes',
		placement: 'header',
		links: [{ label: 'Almond', href: '/manicure/almond-nails/' }],
	},
] as const;

runSiteContentRepositoryContract({
	name: 'InMemorySiteContentRepository',
	createRepository: () => new InMemorySiteContentRepository({
		faqs: expectedFaqs,
		navigationGroups: expectedNavigationGroups,
	}),
	expectedFaqs,
	expectedNavigationGroups,
});
