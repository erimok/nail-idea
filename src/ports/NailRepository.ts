import type { NailArea } from '../domain/areas';
import type { NailRecord } from '../domain/nail';

/**
 * Returns validated domain records in the repository's canonical order.
 * Each call returns a new array while preserving the record order.
 */
export interface NailRepository {
	findAllNails(): Promise<readonly NailRecord[]>;

	/**
	 * Returns the subset for an area in the same relative order as findAllNails().
	 * Records tagged for both areas are included in manicure and pedicure results.
	 */
	findNailsByArea(area: NailArea): Promise<readonly NailRecord[]>;
}
