import { isPublishedFaq, matchesFaqHub, type FaqRecord } from '../domain/faq';
import type { NailFacetPage } from '../domain/facet-combinations';
import { buildFaqRoute } from '../domain/routes';
import type { FaqItemViewModel } from './view-models';

export function publishedFaqs(faqs: readonly FaqRecord[]): FaqRecord[] {
	return faqs.filter(isPublishedFaq).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function hubFaqs(faqs: readonly FaqRecord[], page: NailFacetPage): FaqRecord[] {
	return publishedFaqs(faqs).filter((faq) => matchesFaqHub(faq, page));
}

export function faqSummary(faq: FaqRecord): FaqItemViewModel {
	return { question: faq.question, answer: faq.summary, href: buildFaqRoute(faq.slug) };
}

export function validateFaqPlacements(faqs: readonly FaqRecord[], pages: readonly NailFacetPage[]): void {
	for (const faq of publishedFaqs(faqs)) {
		for (const hub of faq.hubs) {
			if (!pages.some((page) => page.area === hub.area && page.slug === hub.slug)) {
				throw new Error(`FAQ "${faq.slug}" refers to missing hub /${hub.area}/${hub.slug}/.`);
			}
		}
	}
}

export function validateUniqueFaqQuestions(faqs: readonly FaqItemViewModel[], context: string): void {
	const questions = new Set<string>();
	for (const faq of faqs) {
		const key = faq.question.trim().toLocaleLowerCase('en');
		if (questions.has(key)) throw new Error(`Duplicate FAQ question "${faq.question}" on ${context}; remove the legacy entry when publishing its replacement.`);
		questions.add(key);
	}
}
