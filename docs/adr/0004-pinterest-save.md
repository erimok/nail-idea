# ADR 0004: Save a gallery image to Pinterest

- Status: Accepted
- Date: 2026-11-08
- Scope: nail-design cards and their lightboxes on the homepage, area and hub listings, and their search results.

## Context

Visitors should be able to save a particular design to Pinterest from its listing image or from the lightbox. The Pin should link back to the page from which it was saved. Nails do not have individual public detail pages, and the same design can appear on several pages.

There are currently two gallery implementations:

- `NailCollectionGrid.astro` renders `NailCard.astro` cards and a shared dialog controlled by `grid-gallery.ts`. It is used for homepage featured designs and area/hub listings, including deferred cards revealed by Show more.
- `NailGrid.tsx` renders search results and the React `ImageLightbox.tsx`, on the homepage and collection pages.

The card image is already a button that opens the gallery. The Pinterest control must not be nested inside that button. Pinterest saving is separate from the proposed on-site personal collection in ADR 0001; it does not create local saved state or indicate that a Pin was successfully saved.

## Decision

Use Pinterest's documented **one-image round Save button** for each design card and each lightbox. The link carries the selected image, its description and the canonical URL of the page on which the visitor initiated the action. The site owner selected the official round control instead of a custom icon-only button after the conflict with Pinterest's custom-button brand guidelines was identified.

### Appearance and interaction

- Place the control over the top-right of each design image, in a positioned wrapper as a sibling of the existing zoom button. Keep the existing zoom affordance at the bottom-right. Do not make the entire card a Pinterest link.
- In each lightbox, place the control by the displayed image without covering the close, previous or next controls. Reposition as needed on narrow screens and for images of different proportions. The control always represents the currently displayed image.
- The prerendered link contains Pinterest's hosted round button image with `alt` and `title`. Pinterest's script replaces it with its own round control, which is not an image element. Restore a descriptive link `title` and accessible name such as `Save {design title} to Pinterest` after replacement; do not rely on `title` alone.
- Make the control visible without hover, including on touch devices; give it a minimum 44 by 44 CSS pixel target, visible keyboard focus and sufficient contrast against varied photos. Its hit area must not overlap gallery controls. Tab, Enter and pointer activation must work independently of the zoom button.
- Use the official documented round control rather than an independently styled custom badge. Review Pinterest's current [brand guidelines](https://business.pinterest.com/brand-guidelines/) and [Save button documentation](https://developers.pinterest.com/docs/web-features/buttons/) before release.

### Pin payload and page attribution

For a selected design, supply the following to Pinterest's documented `buttonPin` button, using URL/query-parameter encoding:

| Parameter | Value |
|---|---|
| `url` | The current page's absolute canonical HTML URL, supplied from the page view model's `layout.canonical`. This is the homepage, area or exact hub page where the action was initiated, including when a search result or lightbox is used. Do not use the image URL, a nail slug, a different hub, the Pinterest URL or the browser's query/hash. |
| `media` | An absolute, publicly reachable HTTPS URL to the selected nail image, not the logo, thumbnail selected by Pinterest, or page URL. Prefer an uncropped, sufficiently large generated image; verify that its format, dimensions, and hosting are accepted by Pinterest. |
| `description` | The selected design's existing title and/or description, as appropriate for Pinterest; use content data, not the page title or the visitor's search prompt. |

Pass the canonical URL down from `HomepageView.astro` and `CollectionPageView.astro` to both their static gallery and `IdeaExplorer`/`NailGrid`. This preserves attribution for the same nail on different pages and for a noindex page: the origin page remains the source rather than a substituted indexable hub. A search result inherits the page's canonical URL; search terms are not put into the Pin URL or description.

Resolve relative image URLs against the configured canonical origin, not `window.location.origin`, so preview hosts and browser query parameters do not leak into Pins. Static cards use the existing uncropped `full.src`; search results use the source `imageSrc` supplied by the nail repository. No button is rendered for a search result without an image. The integration is disabled in development because Astro's development image URLs can contain local filesystem paths and are not publicly fetchable; test it against a production build instead.

### Integration

- Pinterest documents `data-pin-do="buttonPin"`, the round shape, a URL containing `url`, `media` and `description`, and one asynchronous `pinit.js` inclusion per page. See [Pinterest's Save button documentation](https://developers.pinterest.com/docs/web-features/buttons/) and [add-on overview](https://developers.pinterest.com/docs/web-features/add-ons-overview/). Do not use the automatic hover button, which would target unrelated images, or the page-wide image picker, which cannot guarantee the chosen design.
- Keep the button's HTML as an actual link with the custom logo and attributes, not a clickable element nested inside another interactive control. The static gallery's links are in prerendered HTML, including deferred cards. The React gallery renders its links with the result cards.
- Both lightboxes must update the share target on open and on every previous/next navigation, including keyboard navigation. The static gallery's `show` operation must use the selected trigger's share data, and the React lightbox must derive it from its active image. Opening or activating Save must not close the dialog or also open the zoom view.
- Pinterest's script replaces the original links asynchronously, removing their accessible labels. The presentation adapter restores those labels, initializes dynamically inserted buttons using Pinterest's exposed `PinUtils.build`, and updates the generated link's target as the selected image changes. It avoids rescanning existing static buttons and waits for replacements rather than building the same dynamic link twice. A plain link remains in the static HTML if the script is blocked, but its no-script save flow is not guaranteed by Pinterest's add-on documentation and requires deployed verification.
- Prefer one coherent presentation-level mapping of share inputs and safe URL serialization for the Astro and React surfaces. Keep platform-specific markup and vendor integration at the presentation edge; services and domain remain independent of Pinterest and emit no HTML or vendor URLs. Pass already available canonical and design data through view models; do not introduce a repository, server endpoint, extra public route, account, local storage or a new dependency for this feature.

### Privacy, security and SEO

The Pinterest add-on script and fallback badge are third-party requests and may collect information under Pinterest's policies. Load the script only on gallery and search pages, once per page; do not add it globally. The privacy policy describes Pinterest's requests and links to its policies. **Before deployment, review whether consent or other measures are required in the regions served**, and check any applicable content-security policy. Opening Pinterest transmits the selected image URL, page URL and design description; no search prompt or personal collection is sent. Links use `rel="noopener noreferrer"` for the new browsing context. Pinterest authentication, board selection and save completion remain Pinterest's responsibility.

No route, canonical, indexing, sitemap, structured data or AI Markdown behavior changes. Existing pages remain prerendered. Pinterest may not be able to fetch local development hosts, private previews or images that require authentication; verify on a publicly reachable deployment.

## Alternatives

| Option | Reason |
|---|---|
| Pinterest automatic hover or page-wide picker | Does not reliably target only the chosen nail and is harder to use on touch. |
| Link to the homepage or a nail detail URL | Loses the actual source page; detail routes do not exist. |
| On-site saves or a Pinterest API integration | Different product feature; requires state or credentials not needed for this action. |
| Plain endpoint link without Pinterest's script | Avoids third-party JavaScript on page load, but the official add-on documentation calls for the script. Keep as an alternative only if Pinterest confirms and testing establishes the desired behavior. |

## Test and release plan

Use AAA tests at the appropriate layer, plus browser and deployed integration checks:

1. Verify URL encoding and round-trip of `url`, `media` and `description`, including spaces, ampersands and non-ASCII text; verify an absolute image URL, a canonical page without query/hash, and two different source pages for the same nail.
2. Verify static card links and the React search-result links each use their own image and page, including missing-image behavior, no nested interactive elements, logo `alt` and `title`, accessible name and keyboard activation. A save activation must not activate zoom.
3. Verify both lightboxes on open, next, previous and keyboard navigation: the Pin media and description change with the displayed image while the originating canonical remains fixed. Verify close, focus restoration and gallery navigation still work.
4. Verify deferred cards after Show more, an empty listing, and dynamically produced search results; confirm script initialization neither duplicates controls nor targets stale images.
5. In built HTML, inspect homepage, an area and representative indexable and noindex hubs. Check page-specific canonical values, one script inclusion per relevant page and no changes to sitemap or page metadata. Test no-JavaScript and blocked-script behavior rather than assuming it.
6. On a publicly accessible staging deployment, use desktop and mobile browsers to save from both gallery implementations and both lightboxes, including after navigation. Confirm Pinterest receives the selected image and the source page, and inspect its resulting Pin link. Check signed-in and signed-out behavior, focus, touch targets, script/network failures and privacy/consent behavior.
7. Run the existing targeted tests, `npm run check`, `npm test` and `npm run build` for the eventual implementation. Record any Pinterest behavior that cannot be verified; do not treat opening Pinterest as proof of a completed save.

## Consequences

Visitors can share a particular design while preserving its listing-page context. The same image may legitimately produce Pins linked to different pages. The integration adds third-party script and brand-policy obligations, and an end-to-end save must still be verified against Pinterest on a publicly reachable deployment.
