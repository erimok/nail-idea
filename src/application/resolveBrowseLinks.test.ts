import { describe, expect, it } from 'vitest';
import { aHub, aNail } from '../test/builders';
import { MIN_DESIGNS_FOR_INDEX } from '../domain/indexability';
import { attachHubEditorial } from './support';
import { getAllFacetPages, getFacetPages } from '../domain/facet-combinations';
import { resolveBrowseLinks } from './resolveBrowseLinks';

describe('resolveBrowseLinks', () => {
	it('filters to indexable hubs, omits the current slug, and labels multi-area links', () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
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

	it('includes indexable populated combination hubs in their own group', () => {
		// Arrange
		const nails = Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) => aNail({
			slug: `red-solid-${index + 1}`,
			colors: ['red'],
			types: ['solid'],
		}));
		const pages = attachHubEditorial(getAllFacetPages(nails).filter(({ area }) => area === 'manicure'), [
			aHub({ area: 'manicure', urlSlug: 'red-solid-nails' }),
		]);

		// Act
		const result = resolveBrowseLinks({ pages, title: 'You may like' });

		// Assert
		expect(result?.groups).toContainEqual({
			label: 'Combinations',
			links: [{ label: 'Red Solid', href: '/manicure/red-solid-nails/' }],
		});
	});

	it('omits the browse section when no populated page is indexable', () => {
		// Arrange
		const pages = attachHubEditorial(
			getFacetPages([aNail({ colors: ['red'] })], 'manicure'),
			[],
		);

		// Act
		const result = resolveBrowseLinks({ pages, title: 'You may like' });

		// Assert
		expect(result).toBeUndefined();
	});

});
