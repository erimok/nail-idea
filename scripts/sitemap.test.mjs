import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectRoot, 'dist', 'client');
const siteUrl = new URL(process.env.SITE_URL ?? 'https://nail.ai');
const getLocations = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/gs)].map(([, location]) => location.trim());

test('production sitemap includes the homepage, area pages, and generated facet pages', async () => {
	const indexXml = await readFile(path.join(distDirectory, 'sitemap-index.xml'), 'utf8');
	const sitemapLocations = getLocations(indexXml);
	assert.ok(sitemapLocations.length > 0, 'sitemap index should point to at least one sitemap');

	const pageLocations = (await Promise.all(sitemapLocations.map(async (location) => {
		const sitemapName = path.basename(new URL(location).pathname);
		const sitemapXml = await readFile(path.join(distDirectory, sitemapName), 'utf8');
		return getLocations(sitemapXml);
	}))).flat();

	const pagePaths = pageLocations.map((location) => new URL(location));
	const hasPath = (pathname) => pagePaths.some((url) => url.origin === siteUrl.origin && url.pathname === pathname);
	assert.ok(hasPath('/'), 'sitemap should include the homepage');
	assert.ok(hasPath('/manicure/'), 'sitemap should include the manicure page');
	assert.ok(hasPath('/pedicure/'), 'sitemap should include the pedicure page');
	assert.ok(pagePaths.some((url) => url.origin === siteUrl.origin && /^\/(manicure|pedicure)\/[^/]+-nails\/$/.test(url.pathname)), 'sitemap should include generated facet pages');

	const homepage = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
	assert.match(homepage, /<title>Manicure and Pedicure Ideas \| Nail\.ai<\/title>/);
	assert.doesNotMatch(homepage, /\b\d+ designs\b/);
	assert.match(homepage, /fonts\.googleapis\.com\/css2/);

	const thinFacet = await readFile(path.join(distDirectory, 'manicure', 'burgundy-nails', 'index.html'), 'utf8');
	assert.match(thinFacet, /<meta name="robots" content="noindex,follow"/);
	assert.doesNotMatch(thinFacet, /\b\d+ designs\b/);

	const picture = homepage.match(/<picture[\s\S]*?<\/picture>/)?.[0];
	assert.ok(picture, 'homepage should render a nail image');
	const alt = picture.match(/\balt="([^"]+)"/)?.[1];
	const title = picture.match(/<h3[^>]*>([^<]+)<\/h3>/)?.[1];
	assert.ok(alt, 'nail image should have descriptive alt text');
	assert.notEqual(alt, title, 'image alt text should describe the image, not repeat its title');

	const srcsets = [...picture.matchAll(/\bsrcset="([^"]+)"/g)].map(([, srcset]) => srcset);
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