import { describe, expect, it } from 'vitest';
import { renderLlmsTxt, renderPageMarkdown } from './markdown';

describe('renderLlmsTxt', () => {
	it('renders grouped indexable pages as Markdown links', () => {
		// Arrange
		const viewModel = {
			areas: [{
				area: 'manicure' as const,
				pages: [{
					title: 'Red [nails]',
					description: 'Ideas for red nails.',
					markdownUrl: 'https://nail.ai/manicure/red-nails.md',
				}],
			}],
		};

		// Act
		const result = renderLlmsTxt(viewModel);

		// Assert
		expect(result).toContain('# Nail.ai');
		expect(result).toContain('## Manicure');
		expect(result).toContain('https://nail.ai/manicure/red-nails.md');
		expect(result).toContain('Ideas for red nails.');
		expect(result).not.toContain('## Pedicure');
		expect(result).not.toContain('<a ');
	});
});

describe('renderPageMarkdown', () => {
	it('renders the shared page content, related hubs, and canonical HTML link', () => {
		// Arrange
		const viewModel = {
			layout: {
				title: 'Red Nail Ideas | Nail.ai',
				description: 'A collection of red nail designs.',
				canonical: 'https://nail.ai/manicure/red-nails/',
				siteChrome: { header: { browseGroups: [], availableAreas: [] }, footer: { groups: [] } },
			},
			heading: 'Red Nails: 6 Ideas',
			prompt: 'red manicure ideas',
			paragraphs: [],
			intro: [{ text: 'Explore red designs.' }],
			designs: [{
				slug: 'red-1',
				title: 'Cherry red tips',
				image: '/images/nails/red-1.jpg',
				imageSrc: '/_astro/red-1.abc123.jpg',
				description: 'Glossy cherry color.',
				colors: ['red'],
				types: ['solid'],
				occasions: [],
				typesOfNails: 'manicure' as const,
				finishes: ['glossy'],
				nailConcerns: [],
			}],
			searchRecords: [],
			breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Manicure', href: '/manicure/' }],
			relatedLinks: {
				title: 'Related ideas',
				groups: [{
					label: 'Colors',
					links: [{ label: 'Rose nails', href: '/manicure/rose-nails/' }],
				}],
			},
			sectionTitle: '6 red nail designs',
			faq: [],
			emptyStateMessage: 'More ideas soon.',
		};

		// Act
		const result = renderPageMarkdown(viewModel);

		// Assert
		expect(result).toContain('# Red Nails: 6 Ideas');
		expect(result).toContain('A collection of red nail designs.');
		expect(result).toContain('Explore red designs.');
		expect(result).toContain('Area: Manicure.');
		expect(result).toContain('(https://nail.ai/_astro/red-1.abc123.jpg)');
		expect(result).toContain('Cherry red tips');
		expect(result).toContain('Glossy cherry color.');
		expect(result).toContain('https://nail.ai/manicure/rose-nails/');
		expect(result).toContain('https://nail.ai/manicure/red-nails/');
		expect(result).not.toContain('<a ');
	});
});
