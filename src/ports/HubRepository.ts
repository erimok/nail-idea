import type { NailArea } from '../domain/areas';
import type { HubEditorial } from '../domain/hub-types';

/**
 * Returns validated domain records in the repository's canonical order.
 * Each call returns a new array while preserving the record order.
 */
export interface HubRepository {
	listHubs(): Promise<readonly HubEditorial[]>;
	getHub(area: NailArea, slug: string): Promise<HubEditorial | null>;
}
