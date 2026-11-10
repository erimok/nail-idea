import { validateFaq, type FaqRecord } from '../../domain/faq';
import { isKnownFaqFacet } from '../../libs/ai/faq-facet-options';
import type { FaqRepository } from '../../ports/FaqRepository';

export class InMemoryFaqRepository implements FaqRepository {
	readonly #faqs: readonly FaqRecord[];

	constructor(faqs: readonly FaqRecord[] = []) {
		this.#faqs = faqs;
	}

	async listFaqs(): Promise<readonly FaqRecord[]> {
		for (const faq of this.#faqs) validateFaq(faq, isKnownFaqFacet);
		return structuredClone(this.#faqs);
	}
}
