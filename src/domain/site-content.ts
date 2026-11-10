export interface FaqEntry {
	question: string;
	answer: string;
	order?: number;
}

export interface NavigationLink {
	label: string;
	href: string;
}

export type NavigationPlacement = 'header' | 'footer' | 'both';

export interface NavigationGroup {
	label: string;
	placement: NavigationPlacement;
	links: readonly NavigationLink[];
}
