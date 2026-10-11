import type { NailArea } from '../../domain/areas';
import type { HubEditorial } from '../../domain/hub-types';
import type { HubRepository } from '../../ports/HubRepository';

export class InMemoryHubRepository implements HubRepository {
	readonly #hubs: readonly HubEditorial[];

	constructor(hubs: readonly HubEditorial[]) {
		this.#hubs = [...hubs];
	}

	async listHubs(): Promise<readonly HubEditorial[]> {
		return [...this.#hubs];
	}

	async getHub(area: NailArea, slug: string): Promise<HubEditorial | null> {
		return this.#hubs.find((hub) => hub.area === area && hub.urlSlug === slug) ?? null;
	}
}
