// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { devNailContentEndpoint } from './src/libs/dev-nail-content-endpoint.ts';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL ?? 'https://nail.ai',
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	image: {
		remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
	},
	integrations: [react(), markdoc(), keystatic(), sitemap()],
	vite: {
		plugins: [tailwindcss(), devNailContentEndpoint()],
	},
});
