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

## Shared vs page-specific

French, nude, almond, and other hub pages share the same dynamic route, hub service, collection template, card/grid, `IdeaExplorer`, layout, header, footer, and JSON-LD builder. There are no separate French-, nude-, or almond-specific page components.

What varies by hub is data and the view model produced for its `{area}` and `{slug}`: title, description, heading, intro, matched designs, prompt, breadcrumbs, related links, section label, and any available editorial FAQs. Those values come from design records, domain rules, and optional hub editorial data; they are not special-cased in the page template.

The homepage has its own route and presentation components (`src/pages/index.astro`, `src/components/HomepageView.astro`, and `src/components/HomeHero.astro`). It reuses the layout, header/footer, design grid/cards, and `IdeaExplorer`, but its homepage-specific sections are not part of a hub page.
