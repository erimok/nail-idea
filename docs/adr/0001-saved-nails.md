# ADR 0001: Like/save nails with a client-side collection page on a static site

- Status: Proposed
- Date: 2026-10-18
- Scope: the "Personal collection" idea in `docs/overview.md`. Global like counts and "Top nails by likes" are out of scope (see Non-goals).

## Context

nail-idea.com is fully prerendered (SSG). Visitors browse hubs at `/{area}/{slug}/` made of nail cards. We want visitors to save ("like") designs and see them on a separate page.

Constraints:

- No server, accounts or database at runtime. Saved state is per visitor, so it cannot be baked in at build time.
- Nails have no detail pages. A nail is identified only by its `slug` (`NailRecord.slug`).
- Hub pages must stay fully static and cacheable. Per-visitor state must not change the prerendered HTML, so SEO output stays identical for crawlers.
- `AGENTS.md` rules apply: hexagonal layers, view models from services, Astro files only wire and present, a repository port for every data source (including `localStorage`), AAA tests.
- The AI layer is not implemented and is not touched by this change.

## Decision

Store saves in the visitor's browser behind a `SavedNailsRepository` port. Render a static `/saved/` page shell that hydrates a client island. The island reads the saved slugs and resolves them against a static, prerendered nail catalog JSON.

### 1. Storage: browser `localStorage`, behind a port

- Key: `nailai:saved:v1`. Value: `{ "version": 1, "items": [{ "slug": "...", "savedAt": "<ISO-8601>" }] }`.
- Store only slugs and timestamps, never nail content. Content comes from the catalog, so copy and image edits reach saved items without migration.
- `savedAt` is passed in by the caller (the domain never reads the clock). Order: most recently saved first, ties broken by slug ascending.
- `version` allows later migration (for example to accounts). Corrupt or unknown payloads are treated as an empty collection and are not overwritten until the next save. The adapter validates the payload with `zod` at the boundary.
- Cross-tab sync uses the `storage` event. Same-tab updates use an in-process subscription so every save button and the saved page stay consistent.
- Slugs no longer in the catalog (a nail was removed) are ignored when rendering and pruned on the next write.
- If `localStorage` throws (quota, privacy mode), the adapter falls back to an in-memory store for the session and returns an explicit typed status so the UI can show a "saves won't persist" notice. The error is not swallowed.

Alternatives considered:

| Option | Why not for v1 |
|---|---|
| Accounts + database | Needs a runtime backend, auth and privacy handling. Contradicts SSG and is not scoped. The port keeps it open. |
| Cookies | Sent with every request, 4 KB cap, no benefit on static hosting. |
| IndexedDB | More capable than needed for a list of slugs. Swappable via the port. |
| URL state (`/saved/?ids=a,b`) | Good for sharing, poor as primary store. Possible follow-up. |
| Server-rendered saved page | No per-visitor server state on a static site. |

### 2. Layering

Follows the new-feature order from `AGENTS.md`.

| Layer | Addition |
|---|---|
| `domain` | `saved-nails.ts`: pure, immutable functions `addSaved`, `removeSaved`, `toggleSaved`, `isSaved`, `pruneUnknown`, `resolveSavedNails(collection, catalog)`, and the constant `MAX_SAVED_NAILS` (500). Adding is idempotent. Exceeding the cap throws a typed `SavedNailsLimitError`. |
| `ports` | `SavedNailsRepository`: `load()`, `save(collection)`, `subscribe(listener) => unsubscribe`. Synchronous, because the browser store is. An async port can be added if accounts arrive. |
| `application` | `buildSavedPage(siteConfig, ...)` returns `SavedPageViewModel` (title, description, canonical URL, empty-state copy and links, `catalogUrl`). It is static and holds no per-visitor data. `buildNailCatalog(nailRepository)` returns `NailCatalogViewModel`: display fields per nail (`slug`, `title`, `description`, `imageSrc`, `imageAlt`, key facets, hub links from the route builder, filtered through `resolveBrowseLinks` so only indexable hubs are linked). One service per file. |
| `adapters/browser-storage` | `LocalStorageSavedNailsRepository`, the only module touching `localStorage`, plus `storage` event wiring. |
| `adapters/in-memory` | `InMemorySavedNailsRepository` for tests and as the runtime fallback. Both implementations pass one shared contract suite. |
| `adapters/presentation/human` | `SaveButton` and `SavedNailsView` components. |
| composition | `composition.ts` keeps build-time wiring. A separate `src/browser-composition.ts` picks the localStorage repository (fallback in-memory) for islands. Components never construct repositories. |
| `pages` | `src/pages/saved.astro` (wiring + presentation) and `src/pages/data/nail-catalog.json.ts` (thin prerendered endpoint). |

### 3. Presentation (human layer)

**Save button**

- `NailCard.astro` renders a `SaveButton` island with `slug` and `title`. Prerendered HTML always shows the default "not saved" state, so output is identical for every visitor and crawler.
- Hydration with `client:visible`, so off-screen cards cost nothing. All islands share one repository instance and subscribe to it.
- Accessibility: `<button type="button" aria-pressed>` named "Save {title}", a polite live region for state changes, and a text alternative for the icon.
- Fixed button size, so hydration causes no layout shift.
- `NailGrid.tsx` (AI explorer results) uses the same component. Card, grid and saved page make three usages.

**Saved page `/saved/`**

- Static shell prerendered by Astro: header, H1, description, empty-state copy and a skeleton. `saved.astro` calls `buildSavedPage` and passes the view model to `SavedNailsView`.
- `SavedNailsView` (`client:load`) on mount:
  1. loads saved slugs from the repository,
  2. fetches `/data/nail-catalog.json` once,
  3. joins them with `resolveSavedNails` and renders cards in saved order,
  4. subscribes, so removals update the grid without reload.
- States: loading, empty (links to hubs from the view model), populated, storage-unavailable notice, and "N saved designs no longer exist".
- Each saved card has "Remove" and links to indexable hubs only (no detail pages exist). "Clear all" asks for confirmation.

**Why a catalog JSON instead of embedding data**

- Embedding all nails in `/saved/` HTML bloats the page and duplicates data. Fetching only on the saved page leaves hub pages untouched.
- The JSON is generated from the same `NailRepository` through one service, so titles and images match hub pages.
- It contains display fields only, not the Keystatic content shape. Image URLs come from the existing pipeline (`getNailImageMetadata`) at build time.

### 4. SEO and indexing

- `/saved/` is personal and empty for crawlers: `noindex, follow`. It is excluded from the sitemap, browse links and any future AI-layer output. This goes through the single indexability function as a route kind that is never indexable, not a special case in sitemap code.
- `saved` and `data` become reserved top-level paths and the slug-collision logic must reject them as areas.
- `/data/nail-catalog.json` is not a page, is not in the sitemap, and is not linked from HTML.
- Hub HTML is unchanged apart from the button markup, so structured data and rankings are unaffected. The extra JS is deferred until cards are visible.
- The header gets a static "Saved" link to `/saved/`. A hydrated count badge is shown only when the count is above zero.

### 5. Privacy

- Data never leaves the browser and no analytics event includes the slug list.
- The saved page states that saves live on this device and disappear if browser data is cleared.

### 6. Docs

- Add `/saved/` (noindex) to the routes section of `docs/overview.md` and move "Personal collection" out of product ideas when shipped.
- Update domain rules in `AGENTS.md` in the same change.

## Testing

All tests use AAA and are co-located.

| Layer | Tests |
|---|---|
| `domain/saved-nails` | add, remove, toggle, idempotent add, ordering (`savedAt`, then slug), prune unknown, cap boundary (`MAX_SAVED_NAILS` vs +1), empty collection, `resolveSavedNails` ignores unknown slugs and keeps order. |
| Port contract suite | Run against in-memory and localStorage (with a `Storage` fake): round trip, subscribe/unsubscribe, corrupt payload gives empty, unknown version gives empty, write failure falls back without throwing. |
| `application` | `buildSavedPage` and `buildNailCatalog` with in-memory `NailRepository`: catalog fields, `both` nails, hub links only for indexable hubs (5 vs 6 designs), empty pedicure area. |
| Presentation | Vitest + Testing Library (as `IdeaExplorer.test.tsx`): `SaveButton` pressed state; `SavedNailsView` loading, empty, populated, removal, cross-tab `storage` event. |
| Build smoke | `npm test` checks that `/saved/` is absent from the sitemap and has `noindex`. |

## Consequences

Positive:

- Static hosting, no backend, no impact on prerendered SEO output.
- Storage is isolated behind a port, so moving to accounts or IndexedDB changes one adapter.
- One catalog source keeps hub pages and the saved page consistent.

Negative:

- Saves are per browser and device, lost if site data is cleared, with no sync.
- The saved page needs JS and a second request. Without JS it shows the static empty state and a notice.
- The catalog JSON grows with the number of nails. If it passes roughly 200 KB gzipped, shard by area.
- The hub card and saved card must share one presentation component to avoid drift.

## Non-goals and future work

- **Global like counts and top lists.** Need a shared writable backend, duplicate-vote prevention and abuse protection, which breaks pure SSG. They need their own ADR and a separate `LikeRepository` port (interface segregation). Rankings could later ship as a build-time snapshot.
- **Accounts and sync.** Add an async adapter. Import the `v1` local payload on first sign-in.
- **Shareable collections.** Encode slugs in a URL and render the same view read-only.
- **Named collections or notes.** Requires a new schema version.

## Rollout plan

1. Domain functions and tests.
2. Port, in-memory implementation, contract suite.
3. LocalStorage adapter and browser composition.
4. `buildNailCatalog`, `buildSavedPage` and catalog endpoint.
5. `SaveButton` in `NailCard.astro` and `NailGrid.tsx`.
6. `/saved/` page, header link, `noindex` and sitemap exclusion.
7. Update docs. Run `npm run check`, `npm test`, `npm run build`.

## Open questions

- Is a cap of 500 saved items acceptable?
- Should the header "Saved" link show for everyone or only after the first save?
- Is `/saved/` final? It becomes a public contract once published.
- Should the UI say "Save" or "Like"? Proposed: "Save" with a heart icon.
