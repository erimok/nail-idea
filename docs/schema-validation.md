# Structured Data Validation

## Local production checks

The `npm test` sitemap smoke test parses the built homepage JSON-LD as JSON, requires an `@graph`, checks that there is one JSON-LD script, and compares every visible homepage FAQ question and answer with the `FAQPage` entity. Built collection pages emit `CollectionPage`, `ItemList`, and `BreadcrumbList` entities; curated hub FAQ entities are generated from the same Keystatic FAQ records as visible `<details>` content.

The production build and these local checks pass.

## External validation

The Schema.org Validator and Google Rich Results Test have not been run. No external validator result is claimed; run one after editorial hub content and the final branded social image are approved.
