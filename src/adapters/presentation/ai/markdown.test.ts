import { describe, expect, it } from 'vitest';
import { renderFaqMarkdown, renderLlmsTxt, renderPageMarkdown } from './markdown';

describe('renderFaqMarkdown', () => {
	it('renders the full answer, related links, and canonical HTML URL', () => {
		// Arrange
		const viewModel = {
			layout: {
				title: 'A question',
				description: 'A description',
				canonical: 'https://nail-idea.com/faq/example/',
				siteChrome: { faqIndexHref: '/faq/', header: { browseGroups: [], availableAreas: [] }, footer: { groups: [] } },
			},
			heading: 'What is [red]?',
			answer: 'First paragraph.\n\nSecond paragraph.',
			breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'FAQs', href: '/faq/' }, { label: 'What is [red]?' }],
			relatedLinks: [{ label: 'Red nails', href: '/manicure/red-nails/' }],
		};

		// Act
		const result = renderFaqMarkdown(viewModel);

		// Assert
		expect(result).toContain('# What is \\[red]?');
		expect(result).toContain('First paragraph.');
		expect(result).toContain('Second paragraph.');
		expect(result).toContain('https://nail-idea.com/manicure/red-nails/');
		expect(result).toContain('https://nail-idea.com/faq/example/');
		expect(result).not.toContain('<a ');
	});
});

describe('renderLlmsTxt', () => {
	it('renders grouped indexable pages as Markdown links', () => {
		// Arrange
		const viewModel = {
			areas: [{
				area: 'manicure' as const,
				pages: [{
					title: 'Red [nails]',
					description: 'Ideas for red nails.',
					markdownUrl: 'https://nail-idea.com/manicure/red-nails.md',
				}],
			}],
		};

		// Act
		const result = renderLlmsTxt(viewModel);

		// Assert
		expect(result).toContain('# nail-idea.com');
		expect(result).toContain('## Manicure');
		expect(result).toContain('https://nail-idea.com/manicure/red-nails.md');
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
				title: 'Red Nail Ideas | nail-idea.com',
				description: 'A collection of red nail designs.',
				canonical: 'https://nail-idea.com/manicure/red-nails/',
				siteChrome: { faqIndexHref: '/faq/', header: { browseGroups: [], availableAreas: [] }, footer: { groups: [] } },
			},
			heading: 'Red Nails: 6 Ideas',
			prompt: 'red manicure ideas',
			paragraphs: [],
			intro: [{ text: 'Explore red designs.' }],
			editorialSections: [{ heading: 'Choosing a red shade', body: 'Compare warm and cool reds with a reference image.' }],
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
		expect(result).toContain('## Choosing a red shade');
		expect(result).toContain('Compare warm and cool reds with a reference image.');
		expect(result).toContain('Area: Manicure.');
		expect(result).toContain('(https://nail-idea.com/_astro/red-1.abc123.jpg)');
		expect(result).toContain('Cherry red tips');
		expect(result).toContain('Glossy cherry color.');
		expect(result).toContain('https://nail-idea.com/manicure/rose-nails.md');
		expect(result).not.toContain('https://nail-idea.com/manicure/rose-nails/');
		expect(result).toContain('https://nail-idea.com/manicure/red-nails/');
		expect(result).not.toContain('<a ');
	});
});
