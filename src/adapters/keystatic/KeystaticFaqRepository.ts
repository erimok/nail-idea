import { createReader } from '@keystatic/core/reader';
import { z } from 'zod';
import keystaticConfig from '../../../keystatic.config';
import { nailAreas } from '../../domain/areas';
import { validateFaq, type FaqRecord } from '../../domain/faq';
import { faqFacetOptions, isKnownFaqFacet } from '../../libs/ai/faq-facet-options';
import type { FaqRepository } from '../../ports/FaqRepository';

const entrySchema = z.object({
	question: z.string(),
	status: z.enum(['draft', 'published']),
	summary: z.string(),
	fullAnswer: z.string(),
	metaDescription: z.string(),
	homepage: z.boolean(),
	order: z.number().int(),
	areas: z.array(z.enum(nailAreas)),
	colors: z.array(z.string()),
	types: z.array(z.string()),
	occasions: z.array(z.string()),
	seasons: z.array(z.string()),
	shapes: z.array(z.string()),
	lengths: z.array(z.string()),
	finishes: z.array(z.string()),
	hubs: z.array(z.object({ area: z.enum(nailAreas), slug: z.string() })),
	updated_at: z.string().nullish(),
});

export class KeystaticFaqRepository implements FaqRepository {
	readonly #reader;

	constructor({ rootPath = process.cwd() }: { rootPath?: string } = {}) {
		this.#reader = createReader(rootPath, keystaticConfig);
	}

	async listFaqs(): Promise<readonly FaqRecord[]> {
		const entries = await this.#reader.collections.sharedFaqs.all();
		return entries.map(({ slug, entry }) => {
			const parsed = entrySchema.parse(entry);
			const facets = Object.entries(faqFacetOptions).flatMap(([key, definition]) =>
				parsed[key as keyof typeof faqFacetOptions].map((value) => ({ kind: definition.kind, value })));
			const faq: FaqRecord = {
				slug,
				question: parsed.question,
				summary: parsed.summary,
				fullAnswer: parsed.fullAnswer,
				metaDescription: parsed.metaDescription,
				status: parsed.status,
				homepage: parsed.homepage,
				order: parsed.order,
				areas: parsed.areas,
				facets,
				hubs: parsed.hubs,
				...(parsed.updated_at ? { updatedAt: parsed.updated_at } : {}),
			};
			validateFaq(faq, isKnownFaqFacet);
			return faq;
		});
	}
}
