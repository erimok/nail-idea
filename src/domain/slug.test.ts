import { describe, expect, it } from 'vitest';
import { normalizeSlug } from './slug';

describe('domain slug normalization', () => {
	it('normalizes multiword and accented values', () => {
		// Arrange
		const values = ['Rose Gold', 'Baby shower', 'Ombré'];

		// Act
		const result = values.map((value) => normalizeSlug(value));

		// Assert
		expect(result).toEqual(['rose-gold', 'baby-shower', 'ombre']);
	});

	it('returns an empty slug for blank input', () => {
		// Arrange
		const value = '   ';

		// Act
		const result = normalizeSlug(value);

		// Assert
		expect(result).toBe('');
	});
});
