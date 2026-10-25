import { createReader } from '@keystatic/core/reader';
import { z } from 'zod';
import keystaticConfig from '../../../keystatic.config';
import type { NailArea } from '../../domain/areas';
import type { HubEditorial } from '../../domain/hub-types';
import type { HubRepository } from '../../ports/HubRepository';

const timestampSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
	message: 'Expected a valid timestamp',
});

const hubEntrySchema = z.object({
	area: z.enum(['manicure', 'pedicure']),
	urlSlug: z.string().trim().min(1),
	updated_at: timestampSchema.nullish(),
	intro: z.string().trim().min(1),
	metaDescription: z.string().trim().min(1),
	faq: z.array(z.object({
		question: z.string().trim().min(1),
		answer: z.string().trim().min(1),
	})),
});

interface KeystaticHubRepositoryOptions {
	rootPath?: string;
}

export class KeystaticHubRepository implements HubRepository {
	readonly #reader;

	constructor({ rootPath = process.cwd() }: KeystaticHubRepositoryOptions = {}) {
		this.#reader = createReader(rootPath, keystaticConfig);
	}

	async listHubs(): Promise<readonly HubEditorial[]> {
		const entries = await this.#reader.collections.hubs.all();
		return entries.map(({ entry }) => this.#mapEntry(entry));
	}

	async getHub(area: NailArea, slug: string): Promise<HubEditorial | null> {
		const hubs = await this.listHubs();
		return hubs.find((hub) => hub.area === area && hub.urlSlug === slug) ?? null;
	}

	#mapEntry(entry: unknown): HubEditorial {
		const parsedEntry = hubEntrySchema.parse(entry);
		return {
			area: parsedEntry.area,
			urlSlug: parsedEntry.urlSlug,
			...(parsedEntry.updated_at ? { updatedAt: parsedEntry.updated_at } : {}),
			intro: parsedEntry.intro,
			metaDescription: parsedEntry.metaDescription,
			faq: parsedEntry.faq,
		};
	}
}
