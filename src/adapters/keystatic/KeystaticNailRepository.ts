import { createReader } from '@keystatic/core/reader';
import { z } from 'zod';
import keystaticConfig from '../../../keystatic.config';
import type { NailArea } from '../../domain/areas';
import type { NailRecord } from '../../domain/nail';
import { getNailImageMetadata } from '../../libs/nail-images';
import type { NailRepository } from '../../ports/NailRepository';

const nailEntrySchema = z.object({
	title: z.string().min(1),
	image: z.string().min(1),
	imageAlt: z.string().min(1).optional(),
	description: z.string(),
	typesOfNails: z.enum(['manicure', 'pedicure', 'both']),
	colors: z.array(z.string()),
	types: z.array(z.string()),
	occasions: z.array(z.string()),
	season: z.union([z.string(), z.array(z.string())]).optional(),
	shape: z.string().min(1).optional(),
	length: z.string().min(1).optional(),
	finishes: z.array(z.string()),
	nailConcerns: z.array(z.string()),
});

interface NailImageMetadataLike {
	src: string;
}

interface KeystaticNailRepositoryOptions {
	rootPath?: string;
	imageMetadataResolver?: (imagePath: string) => NailImageMetadataLike;
}

function belongsToArea(nail: NailRecord, area: NailArea): boolean {
	return nail.typesOfNails === area || nail.typesOfNails === 'both';
}

export class KeystaticNailRepository implements NailRepository {
	readonly #reader;
	readonly #imageMetadataResolver;

	constructor({
		rootPath = process.cwd(),
		imageMetadataResolver = getNailImageMetadata,
	}: KeystaticNailRepositoryOptions = {}) {
		this.#reader = createReader(rootPath, keystaticConfig);
		this.#imageMetadataResolver = imageMetadataResolver;
	}

	async findAllNails(): Promise<readonly NailRecord[]> {
		const entries = await this.#reader.collections.nails.all();
		return entries.map(({ slug, entry }) => this.#mapEntry(slug, entry));
	}

	async findNailsByArea(area: NailArea): Promise<readonly NailRecord[]> {
		const nails = await this.findAllNails();
		return nails.filter((nail) => belongsToArea(nail, area));
	}

	#mapEntry(slug: string, entry: unknown): NailRecord {
		const parsedSlug = z.string().min(1).parse(slug);
		const parsedEntry = nailEntrySchema.parse(entry);

		return {
			slug: parsedSlug,
			title: parsedEntry.title,
			image: parsedEntry.image,
			imageSrc: this.#imageMetadataResolver(parsedEntry.image).src,
			imageAlt: parsedEntry.imageAlt,
			description: parsedEntry.description,
			colors: parsedEntry.colors,
			types: parsedEntry.types,
			occasions: parsedEntry.occasions,
			typesOfNails: parsedEntry.typesOfNails,
			season: parsedEntry.season,
			shape: parsedEntry.shape,
			length: parsedEntry.length,
			finishes: parsedEntry.finishes,
			nailConcerns: parsedEntry.nailConcerns,
		};
	}
}
