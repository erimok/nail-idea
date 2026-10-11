// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { devNailContentEndpoint } from './src/libs/dev-nail-content-endpoint.ts';
import { nailAreas } from './src/domain/areas.ts';
import { getAllFacetPages, getNailsForArea } from './src/domain/facet-combinations.ts';
import { isIndexable, isIndexablePage } from './src/domain/indexability.ts';
import { buildAreaRoute, buildFacetRoute } from './src/domain/routes.ts';
import { loadNailEntries } from './src/libs/nail-content.ts';
import { loadHubEditorial, attachHubEditorial } from './src/libs/hubs.ts';

// https://astro.build/config
const nails = await loadNailEntries();
const editorial = await loadHubEditorial();
const sitemapPaths = new Set([
	'/',
	'/about/',
	...nailAreas.flatMap((area) => {
		const areaNails = getNailsForArea(nails, area);
		return isIndexablePage(areaNails.length) ? [buildAreaRoute(area)] : [];
	}),
	...attachHubEditorial(getAllFacetPages(nails), editorial)
		.filter(isIndexable)
		.map((page) => buildFacetRoute(page.area, page.slug)),
]);

export default defineConfig({
	site: process.env.SITE_URL ?? 'https://nail.ai',
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	image: {
		remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
	},
	integrations: [react(), markdoc(), ...(process.env.NODE_ENV === 'development' ? [keystatic()] : []), sitemap({
		filter: (page) => sitemapPaths.has(new URL(page).pathname),
	})],
	vite: {
		plugins: [tailwindcss(), devNailContentEndpoint()],
	},
});
