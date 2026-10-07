# Overview

Nail.ai project is pSEO project that help to find an idea of manicure and pedicure.

## Stack
- TypeScript
- Astro.js
- Keystatic CMS

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

The Astro sitemap integration writes `sitemap-index.xml` during the production build and discovers all prerendered routes automatically. New static routes, including future comparison and guide pages, are included without editing a route list. Set `SITE_URL` to the production origin when building for a different domain; it must match the canonical site URL.

Run `npm test` to run unit tests and the sitemap build smoke test. The sitemap check verifies the index and representative top-level and facet URLs in the generated XML.

Planned routes:

```txt
{manicure|pedicure}/comparison/{type}-vs-{type}/
{manicure|pedicure}/guide/{type}/
```

## Product ideas

- **Top nails by likes:** let visitors like designs and rank popular nails by like count. Explore top lists for manicure, pedicure, and filtered facets; define tie-breaking and duplicate-like prevention when this feature is scoped.
- **Personal collection:** let visitors save and remove nail designs in a private collection, with a dedicated view for saved items. Decide whether the first version stores saves only in the browser or supports accounts and cross-device sync.