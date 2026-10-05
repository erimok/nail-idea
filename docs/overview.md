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
{manicure|pedicure}/{facet}/
```

`facet` is a color, design type, occasion, or season present in the Nails collection for that area. Values are lowercased and normalized to kebab-case (for example, `rose gold` becomes `rose-gold`). Facet URLs share one flat namespace per area; a build error is raised if different facets normalize to the same slug. Records marked for both manicure and pedicure appear in both areas.

Planned routes:

```txt
{manicure|pedicure}/comparison/{type}-vs-{type}/
{manicure|pedicure}/guide/{type}/
```

## Product ideas

- **Top nails by likes:** let visitors like designs and rank popular nails by like count. Explore top lists for manicure, pedicure, and filtered facets; define tie-breaking and duplicate-like prevention when this feature is scoped.
- **Personal collection:** let visitors save and remove nail designs in a private collection, with a dedicated view for saved items. Decide whether the first version stores saves only in the browser or supports accounts and cross-device sync.