# Overview

nail-idea.com is a programmatic SEO site for manicure and pedicure inspiration.

## Stack
- TypeScript
- Astro.js
- Keystatic CMS

## Architecture

The app follows a hexagonal layout: `src/domain` holds pure rules and types, `src/application` holds use-case services that return view models, `src/ports` defines repository/config interfaces, and `src/adapters` contains Keystatic/config/in-memory implementations plus presentation adapters. Dependencies point inward only: `adapters -> application -> domain`.

`src/composition.ts` is the composition root. It is the only place that wires concrete repositories and config into application services for Astro pages.

Route generation lives in the domain route builder (`src/domain/routes.ts`) and combination logic (`src/domain/facet-combinations.ts`). Indexability rules, including the minimum-design threshold, live in `src/domain/indexability.ts`. Astro pages should only call services from `src/composition.ts` and render the returned view models.

## URL structure

Implemented static pages:

```txt
/
/about/
/terms/
/privacy-policy/
/{area}/{slug}.md # Markdown representation of an indexable hub
/llms.txt # index of indexable hub Markdown pages
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

Nail content record slugs use the ordered naming convention `shape-length-color-style`. Include every selected style in the slug, and use `multi-color` as the color segment when that value is selected. Keep existing content filenames and public URLs unchanged. Human-facing titles and prose use natural phrase order, for example `Short Almond Nails: Nude micro French`; write “micro French” with a capital F in prose.

The Astro sitemap integration writes `sitemap-index.xml` during the production build and discovers all prerendered routes automatically. New static routes, including future comparison and guide pages, are included without editing a route list. Set `SITE_URL` to the production origin when building for a different domain; it must match the canonical site URL.

Sitemap `lastmod` for homepage, area, and hub routes uses the latest known nail-record timestamp shown on the page; hub routes also include their editorial record timestamp. Keystatic nail and hub records expose `updated_at`; legacy nail records use `created_at` until an editor records an update. Editors should update `updated_at` when changing a record. Static pages without a reliable content timestamp omit `lastmod` rather than reporting the build date.

Generated area/facet routes share the `/{area}/{slug}/` namespace. These slugs are reserved for hub pages; individual nail detail pages are not implemented. A hub is indexable only when it has at least six matching designs and non-empty curated `intro` and `metaDescription` fields in Keystatic; generated copy does not by itself make a hub indexable. Hub copy is generated from facet data (`src/domain/hub-copy.ts`): a title under 60 characters (normally `{Facet} Nail Ideas: {count} Designs ({year}) | nail-idea.com`; when needed, a compact form preserves the facet and count while omitting the year), a generated meta description that names the design count (`Browse {count} {facet} {area} ideas: ... looks.`), an H1 of the form `{Facet} Nails: {count} Ideas for Every Shape and Length` (the coverage phrase only names shape/length when the page's designs actually vary by it), a 40-70 word intro (hand-written mood sentence from `src/domain/hub-moods.ts`, the top descriptive sub-facets by design count, and up to three links to related indexable hubs that share designs with the current hub). Occasion and season tags are not used as supporting visual attributes in generated copy. Type hubs link only to combination subpages that retain their type facet (for example, the French hub links to French color, length, and finish combinations). Combination breadcrumbs link to the indexable single-facet hub represented by the first facet in the combination URL (for example, `short-chrome-nude-nails` breadcrumbs to `short-nails`); that breadcrumb is omitted when the parent hub is noindex. Combination hubs that include a type facet (the core style, `coreStyleFacetKind`) still link up to that single-type hub with a contextual "Part of our {style} nails collection" sentence. The contextual link is omitted when the core style hub is noindex. The header browse menu groups indexable facet pages by type, color, shape, finish, and length; footer browse groups remain managed in Keystatic, while About, Terms of Use, and Privacy Policy links are always available. The Keystatic `hubs` collection is an optional override: a non-empty `intro` or `metaDescription` replaces the generated one, `sections` supplies hub-specific editorial copy rendered below the design gallery in HTML and Markdown, and `faq` supplies page FAQs. The production sitemap and internal browse links exclude every noindex route. The empty pedicure area remains noindex until it has content.

Hub design grids render every card in the static HTML. They show the first 24 designs initially, then reveal up to 24 more per click; without JavaScript all cards remain visible. The full design list continues to feed search and JSON-LD.

Homepage search results end with a "Show more {hub label}" button that links to the most specific indexable hub covered by the search. For example, "Short nude almond nails with a micro French manicure" links to the combination hub with the most matching facets (`src/domain/search-hub-match.ts`, `findBestHubForSearch`). The prompt's facets map to hub facets in `src/libs/ai/search-facets.ts`. The hub must have all of its facets in the search, and ties go to the hub with more designs. Only indexable hubs are offered (`searchHubLinks` on the homepage view model), so noindex hubs are never linked. The button is hidden when there are no matches or no hub fits. It is shown on the homepage search only; hub and area page search does not receive hub links yet.

Homepage FAQ entries are managed in the Keystatic `faqs` collection, and header/footer browse groups are managed in `navigation`. FAQ and menu display order is set by each entry's `order` field. Navigation links are restricted to generated, indexable hub routes; the About link remains fixed in the presentation.

Run `npm test` to run unit tests and the sitemap build smoke test. The sitemap check verifies the index and representative top-level and facet URLs in the generated XML.

Planned routes:

```txt
{manicure|pedicure}/comparison/{type}-vs-{type}/
{manicure|pedicure}/guide/{type}/
```

Each indexable hub also has a static Markdown representation at
`/{area}/{slug}.md`. `/llms.txt` links to these files, grouped by area. Both
outputs use the hub page view models and exclude routes that fail the shared
indexability rule.

## Product ideas

- **Top nails by likes:** let visitors like designs and rank popular nails by like count. Explore top lists for manicure, pedicure, and filtered facets; define tie-breaking and duplicate-like prevention when this feature is scoped.
- **Personal collection:** let visitors save and remove nail designs in a private collection, with a dedicated view for saved items. Decide whether the first version stores saves only in the browser or supports accounts and cross-device sync.