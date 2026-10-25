import { describe, expect, it } from 'vitest';
import keystaticConfig from '../keystatic.config';

describe('nails collection admin', () => {
	it('exposes content timestamps and initializes them to now', () => {
		// Arrange
		const nails = keystaticConfig.collections.nails;
		const hubs = keystaticConfig.collections.hubs;

		// Act
		const columns = nails.columns;
		const createdAt = nails.schema.created_at.defaultValue();
		const updatedAt = nails.schema.updated_at.defaultValue();
		const hubUpdatedAt = hubs.schema.updated_at.defaultValue();

		// Assert
		expect(columns).toContain('created_at');
		expect(columns).toContain('updated_at');
		expect(createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
		expect(updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
		expect(hubs.columns).toContain('updated_at');
		expect(hubUpdatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
	});
});
