import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import type { NailRecord } from './ai/nail-search';

export async function loadNailEntries(): Promise<NailRecord[]> {
	const reader = createReader(process.cwd(), keystaticConfig);
	const entries = await reader.collections.nails.all();
	return entries.map(({ slug, entry }) => ({
		slug,
		title: entry.title,
		image: entry.image ?? '',
		imageAlt: entry.imageAlt ?? undefined,
		description: entry.description,
		typesOfNails: entry.typesOfNails,
		colors: entry.colors,
		types: entry.types,
		occasions: entry.occasions,
		season: entry.season,
		shape: entry.shape,
		length: entry.length,
		finishes: entry.finishes,
		nailConcerns: entry.nailConcerns,
	}));
}