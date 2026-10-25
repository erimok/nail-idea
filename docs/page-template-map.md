# Hub page template map

## Source files

| Page piece | Source |
|---|---|
| Design records | `keystatic.config.ts` defines the `nails` collection; records live in `src/content/nails/*.yaml`. `src/adapters/keystatic/KeystaticNailRepository.ts` maps them to domain records. |
| Hub route | `src/pages/[area]/[slug].astro` creates routes from `siteServices.listHubRoutes()` and asks `siteServices.buildHubPage()` for the page view model. |
| Hub page template | `src/components/CollectionPageView.astro` renders the hub heading and copy, `IdeaExplorer`, design grid, FAQs, and related links. |
| Design card | `src/components/NailCollectionGrid.astro` maps designs to `src/components/NailCard.astro`. |
| `IdeaExplorer` island | `src/components/IdeaExplorer.tsx`; used by the shared collection view and the homepage hero. |
| Header and footer | `src/components/SiteHeader.astro` and `src/components/SiteFooter.astro`; both are included by the shared layout. |
| Document `<head>` | `src/layouts/BaseLayout.astro` renders title, description, canonical, indexing and social metadata, and serializes structured data as JSON-LD. |
| JSON-LD generator | `buildCollectionStructuredData()` and its image-gallery helper are in `src/application/support.ts`; `src/application/buildHubPage.ts` supplies the hub view-model data. |
| Hub copy and view model | `src/application/buildHubPage.ts` combines facet data, editorial overrides, routes, and shared site chrome for any area/slug. Generated hub copy comes from `src/domain/hub-copy.ts`. |

## Related links ("Explore more")

These rules build a topical silo: the area page is the top hub, single-facet pages are its spokes, and combination pages sit one level below the single-facet page they extend. Links flow down the silo (area -> facet -> combination) so each page passes relevance to the pages that deepen its topic, and sibling or unrelated facet hubs are not cross-linked. This keeps each cluster focused and makes the site structure clear to search engines.

- Area pages (`/manicure/`, `/pedicure/`, built by `src/application/buildAreaPage.ts`) list only single-facet groups: colors, styles (type), occasions, seasons, lengths, and finishes. They do not list shapes or combinations.
- Nested hub pages (for example `/manicure/french-nails/` or `/manicure/medium-nails/`, built by `src/application/buildHubPage.ts`) list only indexable combinations that extend the current page's facets by one facet, such as `/manicure/short-french-nails/`. They never link to unrelated single-facet hubs.
- In Markdown hub pages, these related links point to the corresponding `/{area}/{slug}.md` page; HTML hub pages keep their trailing-slash URLs.

## Shared vs page-specific

French, nude, almond, and other hub pages share the same dynamic route, hub service, collection template, card/grid, `IdeaExplorer`, layout, header, footer, and JSON-LD builder. There are no separate French-, nude-, or almond-specific page components.

What varies by hub is data and the view model produced for its `{area}` and `{slug}`: title, description, heading, intro, matched designs, prompt, breadcrumbs, related links, section label, and any available editorial FAQs. Those values come from design records, domain rules, and optional hub editorial data; they are not special-cased in the page template.

The homepage has its own route and presentation components (`src/pages/index.astro`, `src/components/HomepageView.astro`, and `src/components/HomeHero.astro`). It reuses the layout, header/footer, design grid/cards, and `IdeaExplorer`, but its homepage-specific sections are not part of a hub page.
