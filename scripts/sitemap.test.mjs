import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
});