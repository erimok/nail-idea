import type { FaqEntry, NavigationGroup } from '../domain/site-content';

export interface SiteContentRepository {
	listFaqs(): Promise<readonly FaqEntry[]>;
	listNavigationGroups(): Promise<readonly NavigationGroup[]>;
}
