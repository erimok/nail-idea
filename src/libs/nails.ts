import type { NailRecord, NailSearchRecord } from '../domain/nail';
import { KeystaticNailRepository } from '../adapters/keystatic/KeystaticNailRepository';

const repository = new KeystaticNailRepository();

export async function loadNails(): Promise<NailRecord[]> {
	// TODO: remove wrapper in composition phase.
	return [...await repository.findAllNails()];
}

export function toNailSearchRecords(nails: readonly NailRecord[]): NailSearchRecord[] {
	return nails.map(({ image: _image, ...nail }) => nail);
}
