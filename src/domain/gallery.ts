import type { NailRecord } from './nail';

export const INITIAL_DESIGN_COUNT = 24;
export const SHOW_MORE_BATCH_SIZE = 24;

export interface DesignGrid {
	initial: readonly NailRecord[];
	remaining: readonly NailRecord[];
	batchSize: number;
}

export function splitDesigns(designs: readonly NailRecord[], initialCount: number): DesignGrid {
	return {
		initial: designs.slice(0, initialCount),
		remaining: designs.slice(initialCount),
		batchSize: SHOW_MORE_BATCH_SIZE,
	};
}
