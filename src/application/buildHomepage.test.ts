import { describe, expect, it } from 'vitest';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { aHub, aNail } from '../test/builders';
import { buildHomepage } from './buildHomepage';

describe('buildHomepage', () => {
	it('builds featured designs, categories, and browse features from indexable hubs', async () => {
		// Arrange
		const nails = Array.from({ length: 9 }, (_, index) => aNail({
			slug: `nail-${index + 1}`,
			colors: ['red'],
			types: ['french'],
			shape: 'almond',
			length: 'short',
			finishes: ['glossy'],
			occasions: ['wedding'],
			season: 'spring',
		}));
		const hubs = [
			aHub({ area: 'manicure', urlSlug: 'red-nails' }),
			aHub({ area: 'manicure', urlSlug: 'french-nails' }),
			aHub({ area: 'manicure', urlSlug: 'almond-nails' }),
			aHub({ area: 'manicure', urlSlug: 'short-nails' }),
			aHub({ area: 'manicure', urlSlug: 'wedding-nails' }),
			aHub({ area: 'manicure', urlSlug: 'spring-nails' }),
		];
		const ports = {
			nailRepository: new InMemoryNailRepository(nails),
			hubRepository: new InMemoryHubRepository(hubs),
			siteContentRepository: new InMemorySiteContentRepository({
				faqs: [{ question: 'CMS question?', answer: 'CMS answer.' }],
				navigationGroups: [{
					label: 'CMS links',
					placement: 'both',
					links: [
						{ label: 'Red designs', href: '/manicure/red-nails/' },
						{ label: 'Missing designs', href: '/manicure/missing-nails/' },
					],
				}],
			}),
			siteConfig: new InMemorySiteConfig(),
		};

		// Act
		const result = await buildHomepage(ports);

		// Assert
		expect(result.featured).toHaveLength(9);
		expect(result.categories.map(({ title }) => title)).toEqual([
			'Nail shapes',
			'Nail colors',
			'Designs by occasion',
			'Seasonal nails',
			'French and micro French',
			'Short nails',
		]);
		expect(result.browseFeatures.map(({ title }) => title)).toEqual(['Manicure ideas', 'Browse by shape']);
		expect(result.faqItems).toEqual([{ question: 'CMS question?', answer: 'CMS answer.' }]);
		expect(result.layout.structuredData?.['@graph']).toContainEqual(expect.objectContaining({
			'@type': 'FAQPage',
			mainEntity: [{
				'@type': 'Question',
				name: 'CMS question?',
				acceptedAnswer: { '@type': 'Answer', text: 'CMS answer.' },
			}],
		}));
		expect(result.layout.siteChrome.header.browseGroups.map(({ label }) => label)).toEqual([
			'Type',
			'Color',
			'Shape',
			'Finishes',
			'Length',
		]);
		expect(result.layout.siteChrome.header.browseGroups.flatMap(({ links }) => links)).toContainEqual({
			label: 'French',
			href: '/manicure/french-nails/',
		});
		expect(result.layout.siteChrome.footer.groups).toEqual([{
			label: 'CMS links',
			links: [{ label: 'Red designs', href: '/manicure/red-nails/' }],
		}]);
	});
});
