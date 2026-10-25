import { describe, expect, it } from 'vitest';
import { aNail } from '../test/builders';
import { orderNailsByNewest } from './nail-order';

describe('orderNailsByNewest', () => {
	it('orders by creation date, then update date, newest first', () => {
		// Arrange
		const older = aNail({
			slug: 'older',
			createdAt: '2026-10-01T12:00:00.000Z',
			updatedAt: '2026-10-05T12:00:00.000Z',
		});
		const updatedWithinDate = aNail({
			slug: 'updated-within-date',
			createdAt: '2026-10-02T12:00:00.000Z',
			updatedAt: '2026-10-04T12:00:00.000Z',
		});
		const newest = aNail({
			slug: 'newest',
			createdAt: '2026-10-03T12:00:00.000Z',
			updatedAt: '2026-10-03T12:00:00.000Z',
		});
		const mostRecentlyUpdated = aNail({
			slug: 'most-recently-updated',
			createdAt: '2026-10-02T12:00:00.000Z',
			updatedAt: '2026-10-05T12:00:00.000Z',
		});
		const nails = [older, updatedWithinDate, newest, mostRecentlyUpdated];

		// Act
		const result = orderNailsByNewest(nails);

		// Assert
		expect(result.map(({ slug }) => slug)).toEqual([
			'newest',
			'most-recently-updated',
			'updated-within-date',
			'older',
		]);
		expect(nails).toEqual([older, updatedWithinDate, newest, mostRecentlyUpdated]);
	});

	it('places nails without valid dates after dated nails', () => {
		// Arrange
		const undated = aNail({ slug: 'undated' });
		const dated = aNail({ slug: 'dated', createdAt: '2026-10-01T12:00:00.000Z' });
		const nails = [undated, dated];

		// Act
		const result = orderNailsByNewest(nails);

		// Assert
		expect(result.map(({ slug }) => slug)).toEqual(['dated', 'undated']);
	});
});
