import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectRoot, 'dist', 'client');
const siteUrl = new URL(process.env.SITE_URL ?? 'https://nail-idea.com');
const getLocations = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/gs)].map(([, location]) => location.trim());
const getEntries = (xml) => [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, entry]) => ({
	location: entry.match(/<loc>(.*?)<\/loc>/s)?.[1]?.trim(),
	lastmod: entry.match(/<lastmod>(.*?)<\/lastmod>/s)?.[1]?.trim(),
}));

async function getHtmlFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(entries.map((entry) => {
		const entryPath = path.join(directory, entry.name);
		return entry.isDirectory() ? getHtmlFiles(entryPath) : entry.name.endsWith('.html') ? [entryPath] : [];
	}));
	return nested.flat();
}

async function getMarkdownFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(entries.map((entry) => {
		const entryPath = path.join(directory, entry.name);
		return entry.isDirectory() ? getMarkdownFiles(entryPath) : entry.name.endsWith('.md') ? [entryPath] : [];
	}));
	return nested.flat();
}

test('production sitemap includes source-content lastmod values', async () => {
	const indexXml = await readFile(path.join(distDirectory, 'sitemap-index.xml'), 'utf8');
	const sitemapLocations = getLocations(indexXml);
	const entries = (await Promise.all(sitemapLocations.map(async (location) => {
		const sitemapName = path.basename(new URL(location).pathname);
		const sitemapXml = await readFile(path.join(distDirectory, sitemapName), 'utf8');
		return getEntries(sitemapXml);
	}))).flat();
	const lastmodByPath = new Map(entries.map(({ location, lastmod }) => [new URL(location).pathname, lastmod]));

	assert.match(lastmodByPath.get('/') ?? '', /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
	assert.match(lastmodByPath.get('/manicure/') ?? '', /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
	assert.equal(lastmodByPath.get('/about/'), undefined);
	for (const [pathname, lastmod] of lastmodByPath) {
		if (pathname !== '/about/') {
			assert.match(lastmod ?? '', /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/, `${pathname} should use a content date`);
		}
	}
});

test('production sitemap includes only indexable routes', async () => {
	const indexXml = await readFile(path.join(distDirectory, 'sitemap-index.xml'), 'utf8');
	const sitemapLocations = getLocations(indexXml);
	assert.ok(sitemapLocations.length > 0, 'sitemap index should point to at least one sitemap');

	const pageEntries = (await Promise.all(sitemapLocations.map(async (location) => {
		const sitemapName = path.basename(new URL(location).pathname);
		const sitemapXml = await readFile(path.join(distDirectory, sitemapName), 'utf8');
		return getEntries(sitemapXml);
	}))).flat();

	const pageLocations = pageEntries.map(({ location }) => location);
	const pagePaths = pageLocations.map((location) => new URL(location));
	const hasPath = (pathname) => pagePaths.some((url) => url.origin === siteUrl.origin && url.pathname === pathname);
	const lastmodByPath = new Map(pageEntries.map(({ location, lastmod }) => [new URL(location).pathname, lastmod]));
	const llmsIndex = await readFile(path.join(distDirectory, 'llms.txt'), 'utf8');
	const markdownFiles = await getMarkdownFiles(distDirectory);
	const markdownPaths = markdownFiles.map((file) => `/${path.relative(distDirectory, file)}`);
	const llmsMarkdownPaths = [...llmsIndex.matchAll(/\]\((https?:[^)]+\.md)\)/g)]
		.map(([, url]) => new URL(url).pathname);
	const sitemapHubPaths = pagePaths
		.filter((url) => /^\/(?:manicure|pedicure)\/.+\/$/.test(url.pathname))
		.map((url) => `${url.pathname.slice(0, -1)}.md`);

	assert.deepEqual(markdownPaths.sort(), sitemapHubPaths.sort(), 'every indexable hub should have exactly one Markdown file');
	assert.deepEqual(llmsMarkdownPaths.sort(), markdownPaths.sort(), 'llms.txt should link to every generated Markdown page and no others');
	for (const markdownPath of markdownPaths) {
		const markdown = await readFile(path.join(distDirectory, markdownPath), 'utf8');
		for (const [, imageUrl] of markdown.matchAll(/\]\((https?:[^)]+\/_astro\/[^)]+)\)/g)) {
			const imageFile = path.join(distDirectory, new URL(imageUrl).pathname);
			assert.ok(await access(imageFile).then(() => true).catch(() => false), `${markdownPath} links to missing image ${imageUrl}`);
		}
	}

	assert.ok(hasPath('/'), 'sitemap should include the homepage');
	assert.ok(hasPath('/manicure/'), 'sitemap should include the manicure page');
	assert.ok(!hasPath('/pedicure/'), 'empty pedicure page should not be in the sitemap');
	for (const [pathname, lastmod] of lastmodByPath) {
		if (pathname === '/about/') {
			assert.equal(lastmod, undefined, 'static About page should omit lastmod without a source timestamp');
		} else {
			assert.match(lastmod ?? '', /^\d{4}-\d{2}-\d{2}(?:T00:00:00\.000Z)?$/, `${pathname} should have a date-only lastmod`);
		}
	}

	let noindexHubPath;
	for (const htmlFile of await getHtmlFiles(distDirectory)) {
		const html = await readFile(htmlFile, 'utf8');
		const document = new JSDOM(html).window.document;
		const relative = path.relative(distDirectory, htmlFile);
		const pathname = relative === 'index.html' ? '/' : `/${relative.replace(/\/index\.html$/, '').replace(/\.html$/, '')}/`;
		assert.equal(document.querySelectorAll('main').length, 1, `${pathname} should have one main landmark`);
		assert.equal(document.querySelectorAll('h1').length, 1, `${pathname} should have one H1`);
		for (const image of document.querySelectorAll('img:not([data-gallery-image])')) {
			assert.ok(image.hasAttribute('alt'), `${pathname} images should have alt attributes`);
			assert.ok(image.hasAttribute('width') && image.hasAttribute('height'), `${pathname} images should have intrinsic dimensions`);
		}
		assert.equal(document.querySelectorAll('a a').length, 0, `${pathname} should not nest links`);
		for (const anchor of document.querySelectorAll('a[href^="/"]')) {
			const target = new URL(anchor.getAttribute('href'), siteUrl);
			const targetFile = path.join(distDirectory, target.pathname.replace(/^\//, ''), 'index.html');
			assert.ok(await access(targetFile).then(() => true).catch(() => false), `${pathname} links to missing ${target.pathname}`);
		}
		if (document.querySelector('meta[name="robots"][content="noindex,follow"]')) {
			assert.ok(!hasPath(pathname), `noindex page ${pathname} must not appear in the sitemap`);
			if (/^\/(?:manicure|pedicure)\/[^/]+\/$/.test(pathname)) {
				noindexHubPath ??= pathname;
				assert.equal(document.querySelector('[data-show-more]'), null, `${pathname} should not show a button without deferred cards`);
			}
		}
	}

	const homepage = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
	assert.match(homepage, /<title>Manicure Ideas by Color, Shape &amp; Occasion \| nail-idea\.com<\/title>/);
	assert.match(homepage, /<meta name="description" content="Browse manicure ideas by color, shape, and occasion, or describe your look and get matching nail designs\."/);
	assert.doesNotMatch(homepage, /\b\d+ designs\b/);
	assert.match(homepage, /fonts\.googleapis\.com\/css2/);
	assert.equal([...homepage.matchAll(/<h1\b/g)].length, 1, 'homepage should render one H1');
	assert.equal([...homepage.matchAll(/<main\b/g)].length, 1, 'homepage should render one main landmark');
	const featuredCount = [...homepage.matchAll(/<article class="group flex h-full/g)].length;
	assert.ok(featuredCount >= 6 && featuredCount <= 9, 'homepage should render 6 to 9 featured designs');
	assert.match(homepage, /href="\/manicure\/"[^>]*>View all manicure ideas<\/a>/);
	assert.doesNotMatch(homepage, /href="\/pedicure\//);
	assert.doesNotMatch(homepage, /keystatic/i);
	assert.doesNotMatch(homepage, /images\.unsplash\.com/);
	assert.match(homepage, /og\/home\.jpg/);
	assert.match(homepage, /og:image:width" content="1200"/);
	assert.match(homepage, /twitter:image:alt/);
	assert.match(homepage, /Disclaimer: Images are AI-generated visual references\./);
	assert.equal([...homepage.matchAll(/type="application\/ld\+json"/g)].length, 1, 'homepage should render one JSON-LD graph');
	const document = new JSDOM(homepage).window.document;
	const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}');
	assert.ok(Array.isArray(graph['@graph']), 'homepage JSON-LD should use @graph');
	const schemaFaq = graph['@graph'].find((entry) => entry['@type'] === 'FAQPage').mainEntity;
	const visibleFaq = [...document.querySelectorAll('main details')].map((item) => ({
		question: item.querySelector('summary span:not([aria-hidden="true"])')?.textContent?.trim(),
		answer: item.querySelector('p')?.textContent,
	}));
	assert.deepEqual(visibleFaq.map(({ question }) => question), schemaFaq.map(({ name }) => name));
	assert.deepEqual(visibleFaq.map(({ answer }) => answer), schemaFaq.map(({ acceptedAnswer }) => acceptedAnswer.text));
	assert.ok(await access(path.join(distDirectory, 'robots.txt')).then(() => true));
	const robots = await readFile(path.join(distDirectory, 'robots.txt'), 'utf8');
	assert.match(robots, /Disallow: \/keystatic/);
	assert.match(robots, /Disallow: \/api\/keystatic/);
	assert.match(robots, /User-agent: Googlebot[\s\S]*?Disallow: \/\*\.md\$/);
	assert.match(robots, /User-agent: GPTBot[\s\S]*?Allow: \/llms\.txt[\s\S]*?Allow: \/\*\.md\$/);
	assert.match(await readFile(path.join(distDirectory, '_headers'), 'utf8'), /\/\*\.md\n\s+X-Robots-Tag: noindex, follow/);

	assert.ok(noindexHubPath, 'there should be at least one noindex hub for the exclusion check');
	const markdownPathForNoindexHub = `${noindexHubPath.slice(0, -1)}.md`;
	assert.ok(!markdownPaths.includes(markdownPathForNoindexHub), 'noindex hubs must not have Markdown files');
	assert.ok(!llmsMarkdownPaths.includes(markdownPathForNoindexHub), 'noindex hubs must not appear in llms.txt');
	const thinFacet = await readFile(path.join(distDirectory, noindexHubPath.replace(/^\//, ''), 'index.html'), 'utf8');
	assert.match(thinFacet, /<meta name="robots" content="noindex,follow"/);
	assert.doesNotMatch(thinFacet, /rel="alternate" type="text\/markdown"/);
	const indexableHub = await readFile(path.join(distDirectory, markdownPaths[0].replace(/\.md$/, ''), 'index.html'), 'utf8');
	assert.ok(indexableHub.includes(`<link rel="alternate" type="text/markdown" href="${new URL(markdownPaths[0], siteUrl)}"`), 'indexable hubs should link their Markdown alternate');
	assert.doesNotMatch(thinFacet, /\b\d+ designs\b/);
	assert.ok(!(await access(path.join(distDirectory, 'manicure', 'almond-short-nude-micro-french', 'index.html')).then(() => true).catch(() => false)), 'individual nail detail pages are intentionally not generated');

	const picture = homepage.match(/<picture[\s\S]*?<\/picture>/)?.[0];
	assert.ok(picture, 'homepage should render a nail image');
	const alt = picture.match(/\balt="([^"]+)"/)?.[1];
	const title = picture.match(/<h3[^>]*>([^<]+)<\/h3>/)?.[1];
	assert.ok(alt, 'nail image should have descriptive alt text');
	assert.notEqual(alt, title, 'image alt text should describe the image, not repeat its title');

	const srcsets = [...picture.matchAll(/\bsrc[Ss]et="([^"]+)"/g)].map(([, srcset]) => srcset);
	assert.ok(srcsets.length >= 2, 'optimized image should have AVIF and WebP srcsets');
	for (const srcset of srcsets) {
		const imagePaths = srcset.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]);
		assert.equal(new Set(imagePaths).size, imagePaths.length, 'responsive widths should use distinct image URLs');
		for (const imagePath of imagePaths) {
			assert.match(imagePath, /\.(avif|webp)$/);
			await access(path.join(distDirectory, imagePath.replace(/^\//, '')));
		}
	}
});

test('large hub galleries keep all designs in HTML and small hubs omit the button', async () => {
	const frenchHub = await readFile(path.join(distDirectory, 'manicure', 'french-nails', 'index.html'), 'utf8');
	const frenchDocument = new JSDOM(frenchHub).window.document;
	const frenchCards = frenchDocument.querySelectorAll('article');
	const frenchItemList = JSON.parse(frenchDocument.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}')
		['@graph'].find((entry) => entry['@type'] === 'ItemList');
	assert.ok(frenchCards.length > 24, 'French hub should have enough designs to defer cards');
	assert.equal(frenchDocument.querySelectorAll('article[data-gallery-deferred][hidden]').length, frenchCards.length - 24);
	assert.equal(Number(frenchDocument.querySelector('[data-show-more]')?.getAttribute('data-total-count')), frenchCards.length);
	assert.equal(frenchItemList.itemListElement.length, frenchCards.length, 'JSON-LD should include every server-rendered design');
	assert.match(frenchHub, /<noscript>[\s\S]*?\[data-gallery-deferred\]\[hidden\][\s\S]*?\[data-show-more\]/);

	const htmlFiles = await getHtmlFiles(distDirectory);
	let smallHub;
	for (const htmlFile of htmlFiles) {
		const html = await readFile(htmlFile, 'utf8');
		const document = new JSDOM(html).window.document;
		const relative = path.relative(distDirectory, htmlFile);
		const pathname = relative === 'index.html' ? '/' : `/${relative.replace(/\/index\.html$/, '').replace(/\.html$/, '')}/`;
		if (/^\/(?:manicure|pedicure)\/[^/]+\/$/.test(pathname)
			&& document.querySelector('meta[name="robots"][content="noindex,follow"]')
			&& document.querySelectorAll('article').length <= 24) {
			smallHub = document;
			break;
		}
	}
	assert.ok(smallHub, 'there should be a small noindex hub for the no-button check');
	assert.equal(smallHub.querySelector('[data-show-more]'), null, 'small hubs should not show the button');
});