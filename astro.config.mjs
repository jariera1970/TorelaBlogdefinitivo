// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	output: 'static',
	server: {
		host: '127.0.0.1',
		port: 4321,
		strictPort: true,
	},
	preview: {
		host: '127.0.0.1',
		port: 4321,
		strictPort: true,
	},
	integrations: [mdx(), sitemap()],
});
