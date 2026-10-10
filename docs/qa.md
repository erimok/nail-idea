# Production QA

## Verified

- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm test`: 17 Vitest files / 145 tests pass; production build and sitemap smoke test pass.
- Built HTML audit checks exactly one `<main>` and one `<h1>` per route, intrinsic `width`/`height` and `alt` on images, no nested anchors, and every local link resolves inside `dist/client`.
- Built sitemap excludes `/pedicure/`, every `noindex,follow` page, and hubs without curated editorial metadata.
- Built homepage has one `@graph` JSON-LD script; visible FAQ questions and answers equal the `FAQPage` data.
- Built homepage uses a first-party OG asset, responsive AVIF/WebP hero pictures, and includes robots disallow rules for Keystatic.
- No individual nail detail pages are generated; this was explicitly excluded from the requested scope.
- Browser checks at 360, 390, 768, 1024, and 1440 CSS pixels found no horizontal overflow. The textarea begins at 428, 400, 438, 590, and 746 pixels respectively and is visible within the 900-pixel test viewport.

## Editorial gates

- No hub has approved editorial intro/meta yet. Generated facet pages remain noindex and are not linked from browse navigation or included in the sitemap.
- Nail taxonomy, description, and alt text were not overwritten. Draft audits are in `docs/proposals/retag.md` and `docs/proposals/copy.md`.
- The homepage OG image is a first-party design photo used temporarily; a branded 1200 × 630 asset still needs approval. See `docs/proposals/og-image.md`.

## Not run

- Lighthouse performance/accessibility/SEO scoring and axe color-contrast audit.
- External Rich Results Test or Schema.org validator. Local QA parses the built JSON-LD graph and verifies visible FAQ parity; that is not a substitute for an external schema validator.
- A general-purpose crawler such as linkinator; the production smoke test performs a local built-HTML link-target audit instead.
