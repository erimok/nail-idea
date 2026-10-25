# nail-idea.com

Astro project for discovering manicure and pedicure ideas. See [docs/overview.md](docs/overview.md) for the planned URL structure.

## Requirements

- Node.js 22.19 or newer
- npm

## Development

```sh
npm install
npm run dev
```

Open the site at `http://localhost:4321` and the Keystatic editor at `http://localhost:4321/keystatic`.

Set `SITE_URL` to override the public origin before building for deployment. It is used for canonical URLs and structured data; the default is `https://nail-idea.com`.

Cloudflare Workers Builds should use `npm run build` as the build command and `npx wrangler deploy` as the deploy command. `wrangler.jsonc` points the Worker at Astro's static output in `dist/client` so Wrangler publishes the built site without auto-configuring an Astro Cloudflare adapter.

Keystatic is configured with local storage. Entries are saved under `src/content/ideas/`; configure GitHub storage before enabling the editor on a hosted deployment.

The `Nails` collection stores curated nail ideas and image URLs. Colors, styles, and occasions use predefined options from `src/libs/ai/vocabulary.ts`; the AI search vocabulary is static code, not CMS content. Rebuild the static site after editing nail records.

For ready-to-run local content import examples using `curl` and `.http`, see [Local content import](docs/local-content-import.md).

## Checks

```sh
npm run check
npm test
npm run build
```