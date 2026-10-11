import { describe, expect, it } from 'vitest';
import { buildAreaRoute, buildFacetRoute } from './routes';

describe('domain routes', () => {
	it('builds area and facet routes', () => {
		// Arrange
		const area = 'manicure';
		const slug = 'rose-gold-nails';

		// Act
		const result = [buildAreaRoute(area), buildFacetRoute(area, slug)];

		// Assert
		expect(result).toEqual(['/manicure/', '/manicure/rose-gold-nails/']);
	});
});
