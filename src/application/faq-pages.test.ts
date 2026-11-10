import { describe, expect, it } from 'vitest';
import { InMemoryFaqRepository } from '../adapters/in-memory/InMemoryFaqRepository';
import { InMemoryHubRepository } from '../adapters/in-memory/InMemoryHubRepository';
import { InMemoryNailRepository } from '../adapters/in-memory/InMemoryNailRepository';
import { InMemorySiteConfig } from '../adapters/in-memory/InMemorySiteConfig';
import { InMemorySiteContentRepository } from '../adapters/in-memory/InMemorySiteContentRepository';
import { MIN_DESIGNS_FOR_INDEX } from '../domain/indexability';
import { aHub, aNail } from '../test/builders';
import { aFaq } from '../test/faq-builder';
import { buildFaqIndexPage } from './buildFaqIndexPage';
import { buildFaqPage } from './buildFaqPage';
import { buildHubPage } from './buildHubPage';
import { buildHomepage } from './buildHomepage';
import { buildLlmsIndex } from './buildLlmsIndex';
import { listFaqRoutes } from './listFaqRoutes';
import { listFaqPlacements } from './listFaqPlacements';
import { resolveSitemapRoutes } from './resolveSitemapRoutes';

function ports() {
	return {
		nailRepository: new InMemoryNailRepository(Array.from({ length: MIN_DESIGNS_FOR_INDEX }, (_, index) =>
			aNail({ slug: `red-${index}`, colors: ['red'], types: ['french'] }))),
		hubRepository: new InMemoryHubRepository([aHub({ urlSlug: 'red-nails' })]),
		siteContentRepository: new InMemorySiteContentRepository(),
		siteConfig: new InMemorySiteConfig(),
		faqRepository: new InMemoryFaqRepository([
			aFaq({ facets: [{ kind: 'color', value: 'red' }, { kind: 'type', value: 'french' }] }),
			aFaq({ slug: 'draft', status: 'draft' }),
		]),
	};
}

describe('shared FAQ pages', () => {
	it('lists published FAQs in editorial order and links to their full answers', async () => {
		// Arrange
		const dependencies = {
			...ports(),
			faqRepository: new InMemoryFaqRepository([
				aFaq({ slug: 'later', question: 'Later question?', order: 2 }),
				aFaq({ slug: 'draft', status: 'draft', order: 0 }),
				aFaq({ slug: 'earlier', question: 'Earlier question?', order: 1 }),
			]),
		};

		// Act
		const result = await buildFaqIndexPage(dependencies);

		// Assert
		expect(result.items).toEqual([
			{ question: 'Earlier question?', answer: 'Compare shades.', href: '/faq/earlier/' },
			{ question: 'Later question?', answer: 'Compare shades.', href: '/faq/later/' },
		]);
		expect(result.layout.canonical).toBe('https://nail-idea.com/faq/');
		expect(result.layout.noIndex).toBe(false);
		expect(result.breadcrumbs).toEqual([{ label: 'Home', href: '/' }, { label: 'FAQs' }]);
		expect(result.layout.structuredData?.['@graph']).toContainEqual(expect.objectContaining({
			'@type': 'FAQPage',
			mainEntity: [
				{ '@type': 'Question', name: 'Earlier question?', acceptedAnswer: { '@type': 'Answer', text: 'Compare shades.' } },
				{ '@type': 'Question', name: 'Later question?', acceptedAnswer: { '@type': 'Answer', text: 'Compare shades.' } },
			],
		}));
		expect(result.layout.structuredData?.['@graph']).toContainEqual(expect.objectContaining({
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nail-idea.com/' },
				{ '@type': 'ListItem', position: 2, name: 'FAQs', item: 'https://nail-idea.com/faq/' },
			],
		}));
	});

	it('marks an empty FAQ listing as noindex', async () => {
		// Arrange
		const dependencies = { ...ports(), faqRepository: new InMemoryFaqRepository() };

		// Act
		const result = await buildFaqIndexPage(dependencies);

		// Assert
		expect(result.items).toEqual([]);
		expect(result.layout.noIndex).toBe(true);
	});

	it('shows each published matching summary once on a combination hub', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = await buildHubPage(dependencies, { area: 'manicure', slug: 'red-french-nails' });

		// Assert
		expect(result.faq).toEqual([{ question: 'How do I choose red nails?', answer: 'Compare shades.', href: '/faq/red-care/' }]);
	});

	it('builds the full answer with links only to indexable hubs', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = await buildFaqPage(dependencies, 'red-care');

		// Assert
		expect(result.answer).toBe('Compare shades with a reference image.');
		expect(result.layout.canonical).toBe('https://nail-idea.com/faq/red-care/');
		expect(result.layout.markdownAlternate).toBe('https://nail-idea.com/faq/red-care.md');
		expect(result.relatedLinks).toEqual([{ label: 'Red manicure ideas', href: '/manicure/red-nails/' }]);
		expect(result.breadcrumbs).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'FAQs', href: '/faq/' },
			{ label: 'How do I choose red nails?' },
		]);
		expect(result.layout.structuredData?.['@graph']).toContainEqual(expect.objectContaining({
			'@type': 'FAQPage',
			mainEntity: [{
				'@type': 'Question',
				name: 'How do I choose red nails?',
				acceptedAnswer: { '@type': 'Answer', text: 'Compare shades with a reference image.' },
			}],
		}));
		expect(result.layout.structuredData?.['@graph']).toContainEqual(expect.objectContaining({
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nail-idea.com/' },
				{ '@type': 'ListItem', position: 2, name: 'FAQs', item: 'https://nail-idea.com/faq/' },
				{ '@type': 'ListItem', position: 3, name: 'How do I choose red nails?', item: 'https://nail-idea.com/faq/red-care/' },
			],
		}));
	});

	it('rejects a request for a draft', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = buildFaqPage(dependencies, 'draft');

		// Assert
		await expect(result).rejects.toThrow('Published FAQ not found');
	});

	it('includes only published FAQ HTML in the sitemap without a fabricated lastmod', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = await resolveSitemapRoutes(dependencies);

		// Assert
		expect(result).toContainEqual({ url: '/faq/red-care/', lastmod: undefined });
		expect(result).toContainEqual({ url: '/faq/' });
		expect(result.some(({ url }) => url.includes('draft') || url.endsWith('.md'))).toBe(false);
	});

	it('omits the FAQ index from the sitemap when no FAQ is published', async () => {
		// Arrange
		const dependencies = { ...ports(), faqRepository: new InMemoryFaqRepository([aFaq({ status: 'draft' })]) };

		// Act
		const result = await resolveSitemapRoutes(dependencies);

		// Assert
		expect(result.some(({ url }) => url === '/faq/')).toBe(false);
	});

	it('lists only published FAQs in the AI index', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = await buildLlmsIndex(dependencies);

		// Assert
		expect(result.faqs).toEqual([{ title: 'How do I choose red nails?', description: 'Explore how to choose red shades.', markdownUrl: 'https://nail-idea.com/faq/red-care.md' }]);
	});

	it('fails on stale explicit hub placements', async () => {
		// Arrange
		const dependencies = { ...ports(), faqRepository: new InMemoryFaqRepository([aFaq({ hubs: [{ area: 'pedicure', slug: 'missing-nails' }] })]) };

		// Act
		const result = resolveSitemapRoutes(dependencies);

		// Assert
		await expect(result).rejects.toThrow('refers to missing hub');
	});

	it('keeps legacy and published homepage answers in editorial order', async () => {
		// Arrange
		const dependencies = {
			...ports(),
			siteContentRepository: new InMemorySiteContentRepository({ faqs: [
				{ question: 'Legacy one?', answer: 'First.', order: 1 },
				{ question: 'Legacy three?', answer: 'Third.', order: 3 },
			] }),
			faqRepository: new InMemoryFaqRepository([aFaq({ homepage: true, order: 2 })]),
		};

		// Act
		const result = await buildHomepage(dependencies);

		// Assert
		expect(result.faqItems.map(({ question }) => question)).toEqual([
			'Legacy one?', 'How do I choose red nails?', 'Legacy three?',
		]);
	});

	it('rejects publishing a duplicate of a legacy homepage question', async () => {
		// Arrange
		const dependencies = {
			...ports(),
			siteContentRepository: new InMemorySiteContentRepository({ faqs: [
				{ question: 'How do I choose red nails?', answer: 'Legacy.' },
			] }),
			faqRepository: new InMemoryFaqRepository([aFaq({ homepage: true })]),
		};

		// Act
		const result = buildHomepage(dependencies);

		// Assert
		await expect(result).rejects.toThrow('Duplicate FAQ question');
	});

	it('generates routes only for published FAQs', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = await listFaqRoutes(dependencies.faqRepository);

		// Assert
		expect(result).toEqual([{ slug: 'red-care' }]);
	});

	it('reports resolved placements for drafts as well as published FAQs', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = await listFaqPlacements(dependencies);

		// Assert
		expect(result.find(({ slug }) => slug === 'draft')?.hubs).toContain('/manicure/red-nails/');
		expect(result.find(({ slug }) => slug === 'draft')?.status).toBe('draft');
	});

	it('returns no routes when the FAQ collection is empty', async () => {
		// Arrange
		const repository = new InMemoryFaqRepository();

		// Act
		const result = await listFaqRoutes(repository);

		// Assert
		expect(result).toEqual([]);
	});

	it('omits a hub timestamp if a displayed FAQ has no reliable update date', async () => {
		// Arrange
		const dependencies = ports();

		// Act
		const result = await resolveSitemapRoutes(dependencies);

		// Assert
		expect(result.find(({ url }) => url === '/manicure/red-nails/')?.lastmod).toBeUndefined();
	});
});
