import type { NailArea } from './areas';

export interface HubFaqItem {
	question: string;
	answer: string;
}

export interface HubEditorialSection {
	heading: string;
	body: string;
}

export interface HubEditorial {
	area: NailArea;
	urlSlug: string;
	updatedAt?: string;
	intro: string;
	metaDescription: string;
	sections?: readonly HubEditorialSection[];
	faq: readonly HubFaqItem[];
}
