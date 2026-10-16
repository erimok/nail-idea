import { describe, expect, it } from 'vitest';
import keystaticConfig from '../keystatic.config';

describe('nails collection admin', () => {
	it('exposes created_at as a column and initializes new records to now', () => {
		// Arrange
		const nails = keystaticConfig.collections.nails;

		// Act
		const columns = nails.columns;
		const createdAt = nails.schema.created_at.defaultValue();

		// Assert
		expect(columns).toContain('created_at');
		expect(createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
	});
});
