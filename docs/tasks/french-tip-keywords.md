# Task: French tip keyword pages SEO readiness

Target keywords (see [mvp.md](../mvp.md)): pink, white, red, blue, short French tip nails; French ombre nails; French manicure ombre.

## Findings

- `npm run build` failed: `scripts/embed-nail-image-metadata.mjs` expected `<slug>/<slug>.jpg`, but 14 image folders contain `image.jpg`.
- Hub titles and H1s rendered "french" in lowercase and never mentioned "French tip".
- Indexable (>= `MIN_DESIGNS_FOR_INDEX`): pink French (11), white French (6). Noindex: red (3), blue (3), short French (1).
- No French + ombre hub is indexable (5 designs have both types).

## Checklist

- [x] Fix the build: the metadata script accepts `image.jpg` (public image URLs unchanged)
- [x] Hub copy words the French type as "French tip" with a capital F (`proseFacetNames` in `src/domain/hub-copy.ts`), with a test
- [ ] Add designs so these hubs reach `MIN_DESIGNS_FOR_INDEX`:
  - red French: 3 more
  - blue French: 3 more
  - short French: 5 more
  - French ombre (`/manicure/french-ombre-nails/`, also targets "french manicure ombre"): 1 more design that is both French and ombre
  - white French: 1-2 spare designs above the threshold
- [ ] Verify robots meta, canonical and sitemap for the 7 target URLs after the content is added

Design records need AI-generated images, so the content items stay open until images are supplied.
