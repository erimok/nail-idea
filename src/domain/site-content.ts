export interface FaqEntry {
	question: string;
	answer: string;
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
