import type { IntroSegment } from '../domain/hub-copy';
import type { NailArea } from '../domain/areas';
import type { HubFaqItem } from '../domain/hub-types';
import type { NailRecord, NailSearchRecord } from '../domain/nail';

export interface LinkViewModel {
	label: string;
	href: string;
}

export interface BreadcrumbViewModel {
	label: string;
	href?: string;
}

export interface FaqItemViewModel {
	question: string;
	answer: string;
}

export interface BrowseLinkGroupViewModel {
	label: string;
	links: readonly LinkViewModel[];
}

export interface FacetBrowseLinksViewModel {
	title: string;
	groups: readonly BrowseLinkGroupViewModel[];
}

export interface SiteChromeViewModel {
	header: {
		browseGroups: readonly BrowseLinkGroupViewModel[];
		availableAreas: readonly LinkViewModel[];
	};
	footer: {
		groups: readonly BrowseLinkGroupViewModel[];
	};
}

export interface LayoutViewModel {
	title: string;
	description: string;
	canonical: string;
	noIndex?: boolean;
	socialImage?: string;
	socialImageAlt?: string;
	structuredData?: Record<string, unknown>;
	siteChrome: SiteChromeViewModel;
}

export interface CollectionPageViewModel {
	layout: LayoutViewModel;
	heading: string;
	prompt: string;
	paragraphs: readonly string[];
	intro?: readonly IntroSegment[];
	designs: readonly NailRecord[];
	searchRecords: readonly NailSearchRecord[];
	breadcrumbs: readonly BreadcrumbViewModel[];
	relatedLinks?: FacetBrowseLinksViewModel;
	sectionTitle: string;
	faq: readonly HubFaqItem[];
	emptyStateMessage: string;
}

export interface HomepageCategoryViewModel {
	title: string;
	description: string;
	thumbnail: NailRecord;
	links: readonly LinkViewModel[];
}

export interface HomepageBrowseFeatureViewModel {
	title: string;
	description: string;
	href: string;
	nail: NailRecord;
}

export interface HomepageViewModel {
	layout: LayoutViewModel;
	nails: readonly NailRecord[];
	searchRecords: readonly NailSearchRecord[];
	featured: readonly NailRecord[];
	categories: readonly HomepageCategoryViewModel[];
	faqItems: readonly FaqItemViewModel[];
	browseFeatures: readonly HomepageBrowseFeatureViewModel[];
}

export interface StaticPageViewModel {
	layout: LayoutViewModel;
}

export interface HubRouteListing {
	areaRoutes: readonly { area: NailArea }[];
	hubRoutes: readonly { area: NailArea; slug: string }[];
	indexableHubRoutes: readonly { area: NailArea; slug: string }[];
}

export interface LlmsIndexViewModel {
	areas: readonly {
		area: NailArea;
		pages: readonly {
			title: string;
			description: string;
			markdownUrl: string;
		}[];
	}[];
}
