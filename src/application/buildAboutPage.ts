import type { SitePorts } from './ports';
import { buildCanonicalUrl, buildSiteChromeViewModel } from './support';
import type { StaticPageViewModel } from './view-models';

export async function buildAboutPage({
	nailRepository,
	hubRepository,
	siteContentRepository,
	siteConfig,
}: SitePorts): Promise<StaticPageViewModel> {
	const [nails, editorial, navigationGroups] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		siteContentRepository.listNavigationGroups(),
	]);

	return {
		layout: {
			title: 'About Nail.ai | Nail Design Inspiration',
			description: 'Learn about Nail.ai, a searchable collection of manicure and pedicure ideas organized around the details you care about.',
			canonical: buildCanonicalUrl(siteConfig.siteUrl, '/about/'),
			siteChrome: buildSiteChromeViewModel(nails, editorial, navigationGroups),
		},
	};
}
