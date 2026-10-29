import type { SitePorts } from './ports';
import { buildCanonicalUrl, buildSiteChromeViewModel } from './support';
import type { StaticPageViewModel } from './view-models';

export interface StaticPageConfig {
	title: string;
	description: string;
	pathname: string;
}

export async function buildStaticPage(
	{ nailRepository, hubRepository, siteContentRepository, siteConfig }: SitePorts,
	{ title, description, pathname }: StaticPageConfig,
): Promise<StaticPageViewModel> {
	const [nails, editorial, navigationGroups] = await Promise.all([
		nailRepository.findAllNails(),
		hubRepository.listHubs(),
		siteContentRepository.listNavigationGroups(),
	]);

	return {
		layout: {
			title,
			description,
			canonical: buildCanonicalUrl(siteConfig.siteUrl, pathname),
			siteChrome: buildSiteChromeViewModel(nails, editorial, navigationGroups),
		},
	};
}
