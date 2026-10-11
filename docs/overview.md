# Overview

Nail.ai project is pSEO project that help to find an idea of manicure and pedicure.

## Stack
- TypeScript
- Astro.js
- Keystatic CMS

## Architecture

The app follows a hexagonal layout: `src/domain` holds pure rules and types, `src/application` holds use-case services that return view models, `src/ports` defines repository/config interfaces, and `src/adapters` contains Keystatic/config/in-memory implementations plus presentation adapters. Dependencies point inward only: `adapters -> application -> domain`.

`src/composition.ts` is the composition root. It is the only place that wires concrete repositories and config into application services for Astro pages.

Route generation lives in the domain route builder (`src/domain/routes.ts`) and combination logic (`src/domain/facet-combinations.ts`). Indexability rules, including the minimum-design threshold and editorial requirements, live in `src/domain/indexability.ts`. Astro pages should only call services from `src/composition.ts` and render the returned view models.

## URL structure

Implemented static pages:

```txt
/
{manicure|pedicure}/
# top level
{manicure|pedicure}/{shape}-nails/ # manicure/almond-nails/
{manicure|pedicure}/{type}-nails/ # manicure/french-nails/
{manicure|pedicure}/{color}-nails/ # manicure/nude-nails/
{manicure|pedicure}/{length}-nails/ # manicure/short-nails/
{manicure|pedicure}/{finishing}-nails/ # manicure/chrome-nails/
{manicure|pedicure}/{occasion}-nails/ # manicure/wedding-nails/
{manicure|pedicure}/{season}-nails/ # manicure/spring-nails/

# 2nd level: every populated pair from color, type, shape, length, finishing
{manicure|pedicure}/{length}-{finishing}-nails/ # manicure/short-chrome-nails/
{manicure|pedicure}/{length}-{color}-nails/ # manicure/short-nude-nails/
{manicure|pedicure}/{length}-{type}-nails/ # manicure/short-french-nails/
{manicure|pedicure}/{length}-{shape}-nails/ # manicure/short-almond-nails/
{manicure|pedicure}/{finishing}-{color}-nails/ # manicure/chrome-nude-nails/
{manicure|pedicure}/{finishing}-{type}-nails/ # manicure/chrome-french-nails/
{manicure|pedicure}/{finishing}-{shape}-nails/ # manicure/chrome-almond-nails/
{manicure|pedicure}/{color}-{type}-nails/ # manicure/nude-french-nails/
{manicure|pedicure}/{color}-{shape}-nails/ # manicure/nude-almond-nails/
{manicure|pedicure}/{shape}-{type}-nails/ # manicure/almond-french-nails/

# 3rd level: every populated triple from color, type, shape, length, finishing
{manicure|pedicure}/{length}-{finishing}-{color}-nails/ # manicure/short-chrome-nude-nails/
{manicure|pedicure}/{length}-{finishing}-{type}-nails/ # manicure/short-chrome-french-nails/
{manicure|pedicure}/{length}-{finishing}-{shape}-nails/ # manicure/short-chrome-almond-nails/
{manicure|pedicure}/{length}-{color}-{type}-nails/ # manicure/short-nude-french-nails/
{manicure|pedicure}/{length}-{color}-{shape}-nails/ # manicure/short-nude-almond-nails/
{manicure|pedicure}/{length}-{type}-{shape}-nails/ # manicure/short-french-almond-nails/
{manicure|pedicure}/{finishing}-{color}-{type}-nails/ # manicure/chrome-nude-french-nails/
{manicure|pedicure}/{finishing}-{color}-{shape}-nails/ # manicure/chrome-nude-almond-nails/
{manicure|pedicure}/{finishing}-{type}-{shape}-nails/ # manicure/chrome-french-almond-nails/
{manicure|pedicure}/{color}-{type}-{shape}-nails/ # manicure/nude-french-almond-nails/
```

Each populated single facet gets a page; `occasion` and `season` are single-facet pages only. Pair and triple pages are generated from `color`, `type`, `shape`, `length`, and `finishing` only when at least one nail matches the full combination. Values are lowercased and normalized to kebab-case (for example, `rose gold` becomes `rose-gold`). URLs share one namespace per area, and a build error is raised if different facets or combinations normalize to the same slug. Records marked for both manicure and pedicure appear in both areas.

Nail content records use the same ordered naming convention: `shape-length-color-style`. Include every selected style in the slug, and use `multi-color` as the color segment when that value is selected. Titles follow the same order in readable form, for example `Almond Short Nails: Nude Micro-French`. The content filename slug and title should describe the same design.

The Astro sitemap integration writes `sitemap-index.xml` during the production build and discovers all prerendered routes automatically. New static routes, including future comparison and guide pages, are included without editing a route list. Set `SITE_URL` to the production origin when building for a different domain; it must match the canonical site URL.

Generated area/facet routes share the `/{area}/{slug}/` namespace. These slugs are reserved for hub pages; individual nail detail pages are not implemented. A hub is indexable only when it has at least six matching designs plus curated intro and meta description in the Keystatic `hubs` collection. The production sitemap and internal browse links exclude every noindex route. The empty pedicure area remains noindex until it has content.

Homepage FAQ entries are managed in the Keystatic `faqs` collection, and header/footer browse groups are managed in `navigation`. FAQ and menu display order is set by each entry's `order` field. Navigation links are restricted to generated, indexable hub routes; the About link remains fixed in the presentation.

Run `npm test` to run unit tests and the sitemap build smoke test. The sitemap check verifies the index and representative top-level and facet URLs in the generated XML.

Planned routes:

```txt
{manicure|pedicure}/comparison/{type}-vs-{type}/
{manicure|pedicure}/guide/{type}/
```

## Product ideas

- **Top nails by likes:** let visitors like designs and rank popular nails by like count. Explore top lists for manicure, pedicure, and filtered facets; define tie-breaking and duplicate-like prevention when this feature is scoped.
- **Personal collection:** let visitors save and remove nail designs in a private collection, with a dedicated view for saved items. Decide whether the first version stores saves only in the browser or supports accounts and cross-device sync.