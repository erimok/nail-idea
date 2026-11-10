import { buildFaqIndexRoute } from '../domain/routes';
import type { SitePorts } from './ports';
import { buildCanonicalUrl, buildFaqStructuredData, buildSiteChromeViewModel } from './support';
import { faqSummary, publishedFaqs } from './faq-support';
import type { FaqIndexPageViewModel } from './view-models';

const heading = 'Nail FAQs';
const description = 'Browse answers to common questions about nail styles, shapes, lengths, colors, and manicure care.';

export async function buildFaqIndexPage({
	nailRepository,
	hubRepository,
	faqRepository,
	siteContentRepository,
	siteConfig,
}: SitePorts): Promise<FaqIndexPageViewModel> {
	const [faqs, nails, hubs, navigationGroups] = await Promise.all([
		faqRepository.listFaqs(),
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		siteContentRepository.listNavigationGroups(),
	]);
	const items = publishedFaqs(faqs).map(faqSummary);
	const canonical = buildCanonicalUrl(siteConfig.siteUrl, buildFaqIndexRoute());
	const breadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'FAQs' },
	] as const;

	return {
		layout: {
			title: `${heading} | nail-idea.com`,
			description,
			canonical,
			noIndex: items.length === 0,
			structuredData: buildFaqStructuredData(canonical, breadcrumbs, items),
			siteChrome: buildSiteChromeViewModel(nails, hubs, navigationGroups),
		},
		heading,
		intro: description,
		breadcrumbs,
		items,
	};
}
