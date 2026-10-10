export interface HubFaqItem {
	question: string;
	answer: string;
}

export interface HubEditorial {
	area: 'manicure' | 'pedicure';
	urlSlug: string;
	intro: string;
	metaDescription: string;
	faq: readonly HubFaqItem[];
}