import { describe, expect, it } from 'vitest';
import type { NailRecord } from './nail';
import { aNail } from '../test/builders';
import { INITIAL_DESIGN_COUNT, SHOW_MORE_BATCH_SIZE, splitDesigns } from './gallery';

describe('splitDesigns', () => {
	it('returns empty lists for empty input', () => {
		// Arrange
		const designs: NailRecord[] = [];

		// Act
		const result = splitDesigns(designs, INITIAL_DESIGN_COUNT);

		// Assert
		expect(result.initial).toEqual([]);
		expect(result.remaining).toEqual([]);
	});

	it('keeps exactly the initial count when input is at the limit', () => {
		// Arrange
		const designs = Array.from({ length: INITIAL_DESIGN_COUNT }, () => aNail());

		// Act
		const result = splitDesigns(designs, INITIAL_DESIGN_COUNT);

		// Assert
		expect(result.initial).toEqual(designs);
		expect(result.remaining).toEqual([]);
	});

	it('puts designs after the initial count in the remaining list', () => {
		// Arrange
		const designs = Array.from({ length: INITIAL_DESIGN_COUNT + 1 }, () => aNail());

		// Act
		const result = splitDesigns(designs, INITIAL_DESIGN_COUNT);

		// Assert
		expect(result.initial).toEqual(designs.slice(0, INITIAL_DESIGN_COUNT));
		expect(result.remaining).toEqual(designs.slice(INITIAL_DESIGN_COUNT));
	});

	it('preserves design order and includes the shared batch size', () => {
		// Arrange
		const designs = [aNail({ slug: 'first' }), aNail({ slug: 'second' }), aNail({ slug: 'third' })];

		// Act
		const result = splitDesigns(designs, 2);

		// Assert
		expect([...result.initial, ...result.remaining]).toEqual(designs);
		expect(result.batchSize).toBe(SHOW_MORE_BATCH_SIZE);
	});
});
