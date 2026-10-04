# Nail.ai Agent Instructions

## Project

- Nail.ai is an Astro and TypeScript pSEO project for manicure and pedicure ideas.
- Treat `docs/overview.md` as the source of truth for the planned URL structure. Update it when route conventions change.
- Use the `NailArea` type and `isNailArea` guard from `src/areas.ts` for the top-level `manicure` and `pedicure` areas.
- Keep content management aligned with `keystatic.config.ts`. The `ideas` collection writes to `src/content/ideas/` and currently uses local storage; configure GitHub storage before enabling hosted content editing.
- Preserve static prerendering for SEO pages unless a route explicitly needs server rendering. Astro's Node adapter supports Keystatic's server-rendered admin UI.
- Add or update Vitest tests for non-trivial TypeScript logic.

## Development

Use Node.js 22.19 or newer and npm. Available checks:

```sh
npm run check
npm test
npm run build
```

When starting the dev server, use background mode:

```
npm run dev -- --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Astro Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
