import { createReader } from '@keystatic/core/reader';
import { z } from 'zod';
import keystaticConfig from '../../../keystatic.config';
import type { FaqEntry, NavigationGroup } from '../../domain/site-content';
import type { SiteContentRepository } from '../../ports/SiteContentRepository';

const faqEntrySchema = z.object({
	order: z.number().int(),
	question: z.string().trim().min(1),
	answer: z.string().trim().min(1),
});

const navigationGroupSchema = z.object({
	order: z.number().int(),
	title: z.string().trim().min(1),
	placement: z.enum(['header', 'footer', 'both']),
	links: z.array(z.object({
		label: z.string().trim().min(1),
		href: z.string().trim().regex(/^\/(?:manicure|pedicure)\/[a-z0-9-]+\/$/),
	})),
});

interface KeystaticSiteContentRepositoryOptions {
	rootPath?: string;
}

export class KeystaticSiteContentRepository implements SiteContentRepository {
	readonly #reader;

	constructor({ rootPath = process.cwd() }: KeystaticSiteContentRepositoryOptions = {}) {
		this.#reader = createReader(rootPath, keystaticConfig);
	}

	async listFaqs(): Promise<readonly FaqEntry[]> {
		const entries = await this.#reader.collections.faqs.all();
		return entries
			.map(({ entry }) => faqEntrySchema.parse(entry))
			.sort((a, b) => a.order - b.order)
			.map(({ question, answer }) => ({ question, answer }));
	}

	async listNavigationGroups(): Promise<readonly NavigationGroup[]> {
		const entries = await this.#reader.collections.navigation.all();
		return entries
			.map(({ entry }) => navigationGroupSchema.parse(entry))
			.sort((a, b) => a.order - b.order)
			.map(({ title, placement, links }) => ({ label: title, placement, links }));
	}
}
