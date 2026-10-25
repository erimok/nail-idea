import type { NailArea } from '../domain/areas';
import type { NailRecord } from '../domain/nail';

/**
 * Returns validated domain records newest-first by creation date, then update date.
 * Each call returns a new array.
 */
export interface NailRepository {
	findAllNails(): Promise<readonly NailRecord[]>;

	/**
	 * Returns the subset for an area in the same relative order as findAllNails().
	 * Records tagged for both areas are included in manicure and pedicure results.
	 */
	findNailsByArea(area: NailArea): Promise<readonly NailRecord[]>;
}
