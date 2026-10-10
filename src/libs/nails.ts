import type { NailRecord, NailSearchRecord } from './ai/nail-search';
import { getNailImageMetadata } from './nail-images';
import { loadNailEntries } from './nail-content';

export async function loadNails(): Promise<NailRecord[]> {
	const nails = await loadNailEntries();
	return nails.map((nail) => ({
		...nail,
		imageSrc: nail.image ? getNailImageMetadata(nail.image).src : undefined,
	}));
}

export function toNailSearchRecords(nails: readonly NailRecord[]): NailSearchRecord[] {
	return nails.map(({ image: _image, ...nail }) => nail);
}