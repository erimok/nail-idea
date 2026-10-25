import type { NailArea } from '../../domain/areas';
import type { NailRecord } from '../../domain/nail';
import { orderNailsByNewest } from '../../domain/nail-order';
import type { NailRepository } from '../../ports/NailRepository';

function belongsToArea(nail: NailRecord, area: NailArea): boolean {
	return nail.typesOfNails === area || nail.typesOfNails === 'both';
}

export class InMemoryNailRepository implements NailRepository {
	readonly #nails: readonly NailRecord[];

	constructor(nails: readonly NailRecord[]) {
		this.#nails = [...nails];
	}

	async findAllNails(): Promise<readonly NailRecord[]> {
		return orderNailsByNewest(this.#nails);
	}

	async findNailsByArea(area: NailArea): Promise<readonly NailRecord[]> {
		return orderNailsByNewest(this.#nails).filter((nail) => belongsToArea(nail, area));
	}
}
