import type { NailRecord } from '../domain/nail';
import { KeystaticNailRepository } from '../adapters/keystatic/KeystaticNailRepository';

const repository = new KeystaticNailRepository();

export async function loadNailEntries(): Promise<NailRecord[]> {
	// TODO: remove wrapper in composition phase.
	return (await repository.findAllNails()).map(({ imageSrc: _imageSrc, ...nail }) => nail);
}
