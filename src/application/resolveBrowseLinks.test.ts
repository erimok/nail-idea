import { describe, expect, it } from 'vitest';
import { aHub, aNail } from '../test/builders';
import { attachHubEditorial } from './support';
import { getFacetPages } from '../domain/facet-combinations';
import { resolveBrowseLinks } from './resolveBrowseLinks';

describe('resolveBrowseLinks', () => {
	it('filters to indexable hubs, omits the current slug, and labels multi-area links', () => {
		// Arrange
		const nails = Array.from({ length: 6 }, (_, index) => aNail({
			slug: `shared-${index + 1}`,
			colors: ['red'],
			typesOfNails: 'both',
		}));
		const pages = attachHubEditorial(
			(['manicure', 'pedicure'] as const).flatMap((area) => getFacetPages(nails, area)),
			[
				aHub({ area: 'manicure', urlSlug: 'red-nails' }),
				aHub({ area: 'pedicure', urlSlug: 'red-nails' }),
			],
		);

		// Act
		const result = resolveBrowseLinks({ pages, title: 'Explore more ideas', currentSlug: 'missing' });

		// Assert
		expect(result).toEqual({
			title: 'Explore more ideas',
			groups: [{
				label: 'Colors',
				links: [
					{ label: 'Red manicure', href: '/manicure/red-nails/' },
					{ label: 'Red pedicure', href: '/pedicure/red-nails/' },
				],
			}],
		});
	});
});
