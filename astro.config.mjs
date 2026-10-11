// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { siteServices, siteUrl } from './src/composition.ts';
import { devNailContentEndpoint } from './src/libs/dev-nail-content-endpoint.ts';

// https://astro.build/config
const sitemapPaths = new Set(await siteServices.resolveSitemapRoutes());

export default defineConfig({
	site: siteUrl,
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
