import { describe, expect, it } from 'vitest';
import { findBestHubForSearch, type SearchHubLink } from './search-hub-match';

function aHubLink(overrides: Partial<SearchHubLink> = {}): SearchHubLink {
	return {
		area: 'manicure',
		facets: [{ kind: 'color', value: 'nude' }],
		href: '/manicure/nude-nails/',
		label: 'nude nails',
		designCount: 10,
		...overrides,
	};
}

const query = {
	area: 'manicure' as const,
	facets: [
		{ kind: 'color' as const, value: 'nude' },
		{ kind: 'length' as const, value: 'short' },
		{ kind: 'shape' as const, value: 'almond' },
	],
};

describe('findBestHubForSearch', () => {
	it('prefers the hub covering the most searched facets', () => {
		// Arrange
		const broad = aHubLink();
		const specific = aHubLink({
			facets: query.facets.slice(0, 2),
			href: '/manicure/short-nude-nails/',
			designCount: 6,
		});

		// Act
		const result = findBestHubForSearch(query, [broad, specific]);

		// Assert
		expect(result).toBe(specific);
	});

	it('ignores hubs with facets the search did not ask for', () => {
		// Arrange
		const hub = aHubLink({
			facets: [{ kind: 'color', value: 'nude' }, { kind: 'type', value: 'french' }],
		});

		// Act
		const result = findBestHubForSearch(query, [hub]);

		// Assert
		expect(result).toBeUndefined();
	});

	it('ignores hubs from another area', () => {
		// Arrange
		const hub = aHubLink({ area: 'pedicure' });

		// Act
		const result = findBestHubForSearch(query, [hub]);

		// Assert
		expect(result).toBeUndefined();
	});

	it('breaks ties with the hub that has more designs', () => {
		// Arrange
		const small = aHubLink({ facets: [{ kind: 'length', value: 'short' }], href: '/manicure/short-nails/', designCount: 6 });
		const large = aHubLink({ designCount: 20 });

		// Act
		const result = findBestHubForSearch(query, [small, large]);

		// Assert
		expect(result).toBe(large);
	});
});
