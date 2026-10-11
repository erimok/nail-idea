import type { FaqEntry, NavigationGroup } from '../../domain/site-content';
import type { SiteContentRepository } from '../../ports/SiteContentRepository';

export class InMemorySiteContentRepository implements SiteContentRepository {
	readonly #faqs: readonly FaqEntry[];
	readonly #navigationGroups: readonly NavigationGroup[];

	constructor({
		faqs = [],
		navigationGroups = [],
	}: {
		faqs?: readonly FaqEntry[];
		navigationGroups?: readonly NavigationGroup[];
	} = {}) {
		this.#faqs = [...faqs];
		this.#navigationGroups = [...navigationGroups];
	}

	async listFaqs(): Promise<readonly FaqEntry[]> {
		return [...this.#faqs];
	}

	async listNavigationGroups(): Promise<readonly NavigationGroup[]> {
		return [...this.#navigationGroups];
	}
}
