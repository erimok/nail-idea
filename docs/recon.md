# Repository Recon

## Routes and nail detail pages

Implemented source routes are `src/pages/index.astro`, `src/pages/[area]/index.astro`, `src/pages/[area]/[slug].astro`, and `src/pages/about.astro`. The two dynamic routes generate area and facet pages from `NailArea` and the facet data. Individual nail detail pages are intentionally excluded from this implementation per the updated request; nail cards remain non-linked cards.

## Pedicure content

The collection contains 15 YAML entries under `src/content/nails/`. All 15 use `typesOfNails: manicure`; there are no pedicure entries. `/pedicure/` is generated but is `noindex,follow`, omitted from internal navigation, and filtered from the sitemap.

## Keystatic

`keystatic.config.ts` defines the `nails` collection at `src/content/nails/*` and an editorial `hubs` collection at `src/content/hubs/*`. The `keystatic()` integration is enabled only in development; production has no `/keystatic` route or public editor link.

## Hubs and indexing

`src/pages/[area]/[slug].astro` is the hub route and delegates rendering to `CollectionPageView.astro`. `getAllFacetPages` in `src/libs/seo-pages.ts` determines generated hubs. `MIN_INDEXABLE` is 6, and a hub also needs editorial intro and meta description to be indexable. There are no editorial hub entries yet, so generated hubs are noindex and excluded from navigation and sitemap.

## Robots and sitemap

`public/robots.txt` disallows `/keystatic` and `/api/keystatic`. `@astrojs/sitemap` uses an explicit allowlist in `astro.config.mjs`, excluding noindex pages.

## Deviations from plan assumptions

- The repository uses one shared `[area]/[slug].astro` route for facet hubs, not `src/pages/manicure/*` routes.
- Nail records live in `src/content/nails/`; there is no `src/content/ideas/` collection.
- No pedicure content exists, so `/pedicure/` is noindex and omitted from internal navigation and sitemap.
- Individual nail detail URLs from plan phase 1.2 are intentionally out of scope; existing detail-page acceptance criteria are therefore not applicable.
- Editorial tagging, descriptions, and alt text are unchanged; review proposals are in `docs/proposals/`.