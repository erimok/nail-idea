# ADR 0002: "Show more" for large hub galleries on a static site

- Status: Accepted
- Date: 2026-10-25
- Scope: design grids on hub pages (`/{area}/{slug}/`). Out of scope: the area index, the homepage, and the AI layer.

## Context

Hubs such as `/manicure/french-nails/` and `/manicure/glossy-nails/` render about 55 cards. The built HTML is roughly 590 KB with 55 images. This hurts LCP and crawl efficiency, and most visitors never scroll that far.

Constraints:

- The site is fully prerendered (SSG). There is no server at runtime, so "load more" cannot call an API.
- Crawlers must still find every design and every internal link on the first request. Content hidden behind JavaScript that is not in the HTML would lose its SEO value and the JSON-LD `ItemList` would no longer match the page.
- `docs/overview.md` and the single indexability rule are unchanged. No new routes are introduced.
- Architecture rules apply: `.astro` files only wire and present. Page size, chunking and ordering are decided in a service and returned in the view model.

## Problem with the obvious approach

A typical "show more" fetches the next batch from the network. On SSG that means either a JSON file per hub (new public URLs, another thing to keep in sync) or client rendering from a data blob. Both duplicate the page content. Neither is needed here.

## Options

| # | Option | Crawlable | HTML size | New URLs | Complexity |
|---|---|---|---|---|---|
| A | Render every card; hide the tail with CSS or `hidden`, reveal on click | Yes, all links in HTML | Unchanged (~590 KB) | None | Very low |
| B | Render the first N cards; fetch the rest from a per-hub JSON file | No (tail not in HTML) | Small | One JSON per hub | Medium |
| C | Render the first N cards in HTML; put the remaining cards in a `<template>` in the same HTML; reveal by cloning | Partly (template content is not indexed as page content) | Unchanged | None | Medium |
| D | Paginated pages (`/{area}/{slug}/page/2/`) with a JS "show more" on top | Yes | Small | Yes, many | High, touches routes, canonicals, sitemap, indexability |
| E | Option A, plus images in the hidden tail do not load until revealed | Yes, all links in HTML | HTML unchanged, image requests drop to the first N | None | Low |

## Decision

Choose **option E**: render all cards in the static HTML, show the first N, and reveal the rest in batches with a small client script. Cards in the hidden tail are real, server-rendered `<article>` elements, so crawlers see every design link and the JSON-LD stays consistent with the page.

Why not the others:

- B and C hide content from crawlers or duplicate it.
- D adds many URLs that compete with the hub itself, and needs canonical, sitemap and indexability decisions. Revisit only if a hub grows past a few hundred designs.
- A alone fixes nothing for image weight, because the browser would still download hidden images unless they are lazy and not displayed. `loading="lazy"` images inside `display: none` or the `hidden` attribute are not fetched in current browsers, which is what E relies on (see "Verification").

HTML size does not shrink with E. The saving is in image requests, decoding and layout. If the HTML weight itself must come down, the card markup should be trimmed first (for example, the `srcset` of each card); that is a separate change.

## Design

### 1. Domain: page-size constant

`src/domain/gallery.ts` (new, pure):

```ts
export const INITIAL_DESIGN_COUNT = 24;
export const SHOW_MORE_BATCH_SIZE = 24;
```

One named home for both numbers, imported by the service and by tests. 24 is divisible by the 1, 2 and 3 column layouts, so a batch never ends on a ragged row.

### 2. Service: view model

`buildHubPage` returns the grid split instead of a flat list. The split is presentation-agnostic, so the AI layer can ignore it and still render every design.

```ts
interface DesignGridViewModel {
	initial: readonly NailRecord[];   // first INITIAL_DESIGN_COUNT designs
	remaining: readonly NailRecord[]; // everything else, in order
	batchSize: number;                // SHOW_MORE_BATCH_SIZE
}
```

`designs` stays on the view model unchanged (full list, used by JSON-LD, search records and the Markdown renderer). `designGrid` is added next to it. If the total is at most `INITIAL_DESIGN_COUNT`, `remaining` is empty and no button is rendered, so small hubs are unchanged.

A pure domain function `splitDesigns(designs, initialCount)` does the split and is unit tested.

### 3. Presentation

`CollectionPageView.astro` passes `designGrid` to `NailCollectionGrid.astro`, which:

1. Renders `initial` cards as today (first 3 eager).
2. Renders each `remaining` card inside the same grid with the `hidden` attribute and `data-gallery-deferred`.
3. Renders a `<button type="button" data-show-more>` after the grid, with the label "Show more designs" and a visible count in an `aria-live="polite"` region ("Showing 24 of 54").
4. Includes a `<noscript>` style so that without JavaScript every card is visible and the button is hidden. Crawlers that do not run JavaScript, and users with JavaScript disabled, get the full list.

The `hidden` attribute is used instead of CSS `display: none` classes so assistive technology and browsers agree the cards are not rendered.

### 4. Client script

`src/libs/gallery/show-more.ts`, about 30 lines, initialised from the grid component next to `initGridGallery`:

- On click, remove `hidden` from the next `batchSize` deferred cards, update the live region, and move focus to the first newly revealed card's button so keyboard users continue from the new content.
- When none remain, remove the button and announce "All 54 designs shown".
- The existing lightbox keeps working because `initGridGallery` already re-queries `[data-gallery-src]` on open (line 45), which includes revealed cards. Hidden cards are excluded from prev/next navigation by filtering on `!hidden`, a one-line change in `grid-gallery.ts`.
- The on-page search (`IdeaExplorer`) is unaffected: it works on `searchRecords`, which still contains all designs.

The script reads the batch size from a `data-batch-size` attribute written by the template from the view model, so the number lives only in the domain constant.

### 5. SEO and structured data

- Canonical, robots, sitemap and `.md` output are unchanged. No new URLs.
- JSON-LD `ItemList` and `hasPart` still list every design, and every design is in the HTML, so the markup matches visible-on-request content.
- Deferred cards keep their normal heading and links. Cards stay in the DOM, so internal-link equity to sub-hubs is unaffected.
- The "Showing 24 of 54" text sits next to the H2 count ("54 French designs"), so the number is consistent for users.

### 6. Accessibility

- Native `<button>`, visible focus ring, same style as other secondary buttons.
- `aria-live="polite"` count update, no focus trap.
- Respects `prefers-reduced-motion`: no scroll animation.

## Rejected alternatives for the reveal step

- **Infinite scroll:** harder to reach the footer, worse for keyboard users, and bad for accessibility.
- **`IntersectionObserver` auto-reveal:** the same issues, plus unpredictable image loading.

## Test plan (AAA, per layer)

| Layer | Test |
|---|---|
| Domain | `splitDesigns`: empty input; exactly `INITIAL_DESIGN_COUNT` (no remainder); one over; order preserved. |
| Service | `buildHubPage` returns `designGrid.remaining` empty for small hubs and the correct split for large ones, using `INITIAL_DESIGN_COUNT` from the domain; `designs` still holds every design. |
| Client script | Unit test with jsdom: click reveals one batch; the button is removed after the last batch; focus moves to the first revealed card. |
| Build smoke | In `french-nails` HTML: all cards are present, the deferred ones have `hidden`, `data-show-more` exists, and `<noscript>` reveals them. A hub below the threshold has no button. |

## Verification

1. Chrome DevTools network tab on `french-nails`: only about 24 image requests on load; clicking the button fetches the next batch only.
2. `curl` the built HTML and count `<article` elements: the count must equal the design count.
3. Lighthouse on `french-nails` before and after (LCP, total image bytes).
4. Safari and Firefox: confirm images inside `hidden` elements are not fetched. If any browser fetches them, fall back to `loading="lazy"` plus `content-visibility: auto`, or render `data-src` and swap on reveal (this has a cost for non-JS crawlers, so it needs another review).

## Risks

- **Lazy images inside hidden elements:** behaviour differs between browsers. This is covered by verification step 4.
- **HTML size is not reduced.** Trimming per-card markup is a separate change.
- **Hidden content and Google:** content hidden by a user-interaction control is generally still indexed, but weighted less. This is acceptable because the first 24 designs carry the page, and the later ones are also linked from sub-hubs.

## Rollout

1. Add the domain constant and `splitDesigns`, with tests.
2. Extend `buildHubPage` and the view model, with tests.
3. Update the grid component, add `show-more.ts`, and adjust the gallery navigation.
4. Run `npm run check`, `npm test` and `npm run build`; run the build smoke checks.
5. Update `docs/overview.md` (hub page behaviour) in the same change.

## Open questions

- Is 24 the right initial count? Real mobile LCP data would settle this; 24 is a starting point.
- Should the button label include the batch size ("Show 24 more")? The wording belongs in the content conventions.
