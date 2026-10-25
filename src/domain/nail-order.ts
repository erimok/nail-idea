import type { NailRecord } from './nail';

function timestamp(value: string | undefined): number {
	if (!value) return Number.NEGATIVE_INFINITY;

	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

export function orderNailsByNewest(nails: readonly NailRecord[]): NailRecord[] {
	return [...nails].sort((left, right) =>
		timestamp(right.createdAt) - timestamp(left.createdAt)
		|| timestamp(right.updatedAt) - timestamp(left.updatedAt));
}
