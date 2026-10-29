import { describe, expect, it } from 'vitest';
import { KeystaticHubRepository } from './KeystaticHubRepository';

const TARGET_HUBS = ['french-nails', 'red-french-nails', 'glossy-nude-french-nails'];
const INDEXABLE_SINGLE_FACET_HUBS = [
	'black-nails',
	'blue-nails',
	'burgundy-nails',
	'multi-color-nails',
	'nude-nails',
	'pink-nails',
	'red-nails',
	'white-nails',
	'yellow-nails',
	'long-nails',
	'medium-nails',
	'short-nails',
	'almond-nails',
	'coffin-nails',
	'square-nails',
	'squoval-nails',
	'glossy-nails',
	'glazed-nails',
	'glitter-nails',
	'matte-nails',
	'micro-french-nails',
	'floral-nails',
	'solid-nails',
	'press-on-nails',
	'ombre-nails',
	'russian-manicure-nails',
	'polka-dot-nails',
	'anniversary-nails',
	'baby-shower-nails',
	'beach-vacation-nails',
	'birthday-nails',
	'christmas-nails',
	'concert-nails',
	'date-night-nails',
	'easter-nails',
	'everyday-nails',
	'festival-nails',
	'graduation-nails',
	'holiday-nails',
	'interview-nails',
	'mothers-day-nails',
	'new-year-nails',
	'office-nails',
	'party-nails',
	'thanksgiving-nails',
	'vacation-nails',
	'valentines-day-nails',
	'wedding-nails',
	'autumn-nails',
	'spring-nails',
	'summer-nails',
	'winter-nails',
];

describe('Keystatic hub editorial copy', () => {
	it('provides 300 to 500 words of distinct guidance on the target French hubs', async () => {
		// Arrange
		const repository = new KeystaticHubRepository({ rootPath: process.cwd() });

		// Act
		const hubs = await repository.listHubs();

		// Assert
		for (const urlSlug of TARGET_HUBS) {
			const hub = hubs.find((candidate) => candidate.area === 'manicure' && candidate.urlSlug === urlSlug);
			expect(hub, `missing editorial content for ${urlSlug}`).toBeDefined();
			const wordCount = (hub?.sections ?? [])
				.flatMap(({ heading, body }) => [heading, body])
				.join(' ')
				.split(/\s+/)
				.filter(Boolean).length;
			expect(wordCount, `${urlSlug} editorial word count`).toBeGreaterThanOrEqual(300);
			expect(wordCount, `${urlSlug} editorial word count`).toBeLessThanOrEqual(500);
		}
	});

	it('provides unique search descriptions for every indexable single-facet hub', async () => {
		// Arrange
		const repository = new KeystaticHubRepository({ rootPath: process.cwd() });

		// Act
		const hubs = await repository.listHubs();

		// Assert
		const facetHubs = INDEXABLE_SINGLE_FACET_HUBS.map((urlSlug) => {
			const hub = hubs.find((candidate) => candidate.area === 'manicure' && candidate.urlSlug === urlSlug);
			expect(hub, `missing editorial content for ${urlSlug}`).toBeDefined();
			if (!hub) throw new Error(`missing editorial content for ${urlSlug}`);
			return hub;
		});
		const intros = facetHubs.map(({ intro }) => intro);
		const descriptions = facetHubs.map(({ metaDescription }) => metaDescription);
		expect(new Set(intros).size).toBe(INDEXABLE_SINGLE_FACET_HUBS.length);
		expect(new Set(descriptions).size).toBe(INDEXABLE_SINGLE_FACET_HUBS.length);

		for (const hub of facetHubs) {
			const introWords = hub.intro.split(/\s+/).filter(Boolean).length;
			expect(introWords, `${hub.urlSlug} intro word count`).toBeGreaterThanOrEqual(40);
			expect(introWords, `${hub.urlSlug} intro word count`).toBeLessThanOrEqual(70);
			expect(hub.metaDescription.length, `${hub.urlSlug} meta description length`).toBeLessThanOrEqual(160);
		}
	});
});
