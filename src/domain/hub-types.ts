import type { NailArea } from './areas';

export interface HubFaqItem {
	question: string;
	answer: string;
}

export interface HubEditorial {
	area: NailArea;
	urlSlug: string;
	intro: string;
	metaDescription: string;
	faq: readonly HubFaqItem[];
}
