# ADR 0003: Reusable facet FAQs and standalone answer pages

- Status: Accepted
- Date: 2026-11-07
- Scope: Keystatic FAQ authoring, homepage and hub FAQ blocks, standalone FAQ HTML and Markdown pages, and their discovery.

## Context

The site has two independent FAQ sources: the `faqs` collection feeds the homepage, while the `faq` array on each `hubs` record feeds an individual hub. Both store one answer, and neither provides a reusable standalone answer page. Hub HTML renders its FAQs and structured data, but the existing hub Markdown renderer does not currently render FAQs.

Editors need to associate questions with facets and write a short answer for relevant pages as well as a fuller, useful answer at `/faq/{slug}/`. The goal is to help visitors explore related topics; publishing more URLs or adding schema markup alone does not establish topical authority or guarantee search visibility.

Existing hub rules remain unchanged: only populated combinations have routes, and a hub is indexable only when it meets the design threshold and has curated intro and meta description. The existing AI layer publishes indexable hub Markdown at `/{area}/{slug}.md` and lists it in `/llms.txt`.

## Decision

Introduce one shared editorial FAQ model. Editors create a draft, supply a summary and full answer, assign relevant facets and areas, and explicitly publish after review. Published entries have a canonical HTML page and an equivalent Markdown page. Matching hub pages show the summary and link to the full answer; published FAQs can also be explicitly featured on the homepage. Preserve existing FAQ blocks during an incremental migration.

### Editorial model and admin workflow

Use a new Keystatic collection, separate from the existing homepage `faqs` collection during migration. The existing collection cannot simply be reinterpreted: its entries have only one answer, and their stored file slugs need not equal their questions.

Each shared FAQ has:

| Field | Purpose |
|---|---|
| Slug | Required, unique, lowercase kebab-case public identifier; independent of question text. Immutable after publication unless an explicit redirect migration is approved. |
| Question | Required title and H1. |
| Summary | Required short, independently useful answer for FAQ blocks; do not generate or truncate it automatically. |
| Full answer | Required, editorially reviewed, substantive answer, stored as structured text or ordered paragraphs, not HTML. It must add useful detail beyond the summary. |
| Meta description | Required editorial description for the standalone page. |
| Status | `draft` or `published`; new entries default to draft. |
| Areas | One or both values from the area registry; limits matching hub placement. Homepage placement is independent of area. |
| Facet assignments | Zero or more `{ kind, value }` selections from the authoritative facet vocabulary; editors should select only genuinely relevant facets. |
| Explicit hub placements | Zero or more `{ area, hub slug }` references, for an exact hub without inheritance; also supports faithful migration of existing hub FAQs. |
| Homepage placement | Explicit boolean, default off. |
| Display order | Integer used consistently for summary blocks; ties break by slug for deterministic builds. |
| Updated timestamp | Optional, editor-maintained content update time; omit `lastmod` when no trustworthy time exists. |

Editors use the local Keystatic admin, select facets using the existing controlled vocabulary, and review both versions before publishing. There is no live placement preview in Keystatic: the build reports resolved hub placements and homepage selection for drafts and published records. Do not introduce hosted editing or change storage mode.

Drafts may be incomplete but must have a valid unique identity. Published entries must pass required-field, slug, area, facet-value and placement validation. Reject invalid published records with an actionable build error; do not silently drop them. Validate facet values against the maintained vocabulary rather than requiring a current nail or generated hub, so an otherwise valid FAQ is not broken when a facet temporarily has no designs. Duplicate assignments are rejected or normalized consistently. Exact hub references must resolve to an existing generated route at build time; a noindex hub can render its own FAQ but must not be linked as a related hub from an FAQ page.

### Matching and presentation

For each hub, include a published FAQ once if either:

1. its allowed areas include the hub's area **and any** assigned `{ kind, value }` equals one of the hub's facets; or
2. its explicit hub placements include that exact area and slug.

Thus an FAQ assigned to both `type: French` and `color: nude` matches either a French hub or a nude hub, including combinations containing either facet; it does **not** require both. The explicit-placement area is part of the target identity. A homepage-only FAQ with no assignments does not appear on hubs. Multiple matches never duplicate an item. Exact placements are an additional placement mechanism, not an exclusion from facet inheritance.

Order by display order, then slug; initially show all matching items without an arbitrary cap. Editors should use broad OR assignments sparingly and audit resulting pages for relevance and repetition. If this becomes unmanageable, a cap, exclusions, or AND matching need a separate editorial/product decision.

The FAQ block shows the question, summary, and a descriptive link to its canonical full answer. Use the existing accessible disclosure pattern and ensure summaries and links work without JavaScript. Omit an empty block. The standalone page shows the question, full answer, and relevant links back to indexable hubs only; use a deterministic, bounded selection if needed to avoid a link farm. Keep homepage and hub FAQ content and structured data consistent with what is displayed. Links to FAQ pages are present in static HTML, not only in scripts.

### URLs, publication and SEO

- HTML: `/faq/{slug}/`; Markdown: `/faq/{slug}.md`. Build both through the shared route builder and canonical origin configuration.
- Only published, valid FAQs produce HTML and Markdown routes. They are indexable, self-canonical, included in the sitemap, and listed in a dedicated FAQ section of `/llms.txt`. Drafts produce no route, link, sitemap entry, or Markdown entry.
- The standalone HTML and Markdown use the same FAQ page view model; Markdown includes the question, full answer, relevant links, and canonical HTML URL. Hub Markdown includes the same FAQ questions, summaries, and FAQ links as hub HTML. Do not create Markdown for noindex hubs.
- Sitemap integration still discovers prerendered pages, while `resolveSitemapRoutes` supplies the existing inclusion filter and optional `lastmod`. Include published FAQ HTML paths in that service, not Markdown paths. Include reliable FAQ timestamps in the homepage and hub `lastmod` calculations when their displayed FAQ content changes; otherwise omit dates that cannot be established reliably.
- Add relevant indexable hub links from the FAQ page and the full-answer link from each relevant hub. Never link to a noindex hub. A FAQ may exist without a matching indexable hub and is still discoverable through its sitemap and `/llms.txt`.
- Keep existing hub indexability and URL rules. FAQ publication has its own single eligibility decision; apply it to route generation, blocks, sitemap and AI discovery. There is no six-design requirement for an FAQ.
- Maintain JSON-LD only where it accurately reflects displayed text; do not promise an FAQ rich result. Google's [search documentation updates](https://developers.google.com/search/updates#removing-faq-rich-result) state that its FAQ rich result is no longer shown. Editorial quality, relevant original detail, accuracy and, where appropriate, sources or review attribution matter more than markup; see Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

Unpublishing or changing a published slug removes public URLs and inbound links. Editors must not rename or unpublish without a separate approved deployment and redirect/removal decision; a static build does not provide redirects by itself.

### Architecture

- **Domain:** a typed FAQ record, facet and placement matching, publication eligibility, validation of identities, and URL builders. Reuse the facet registry, area types and slug conventions; keep domain logic pure.
- **Port and adapters:** a focused read-only FAQ repository with equivalent Keystatic and in-memory implementations and shared contract tests. Map and validate Keystatic data at the adapter boundary. Keep legacy readers only for migration.
- **Application:** build one standalone FAQ view model and reuse it for HTML and Markdown; resolve summary blocks for homepage and hubs from shared data; extend route listing, sitemap and llms index services. Return content and links, not markup.
- **Presentation:** a shared FAQ block renders the supplied view model; a thin static Astro route renders the standalone page. Pure Markdown renderers consume the same view models. Wire dependencies only in the composition root.

Use existing Astro, Keystatic, Zod and Markdown serialization dependencies. No new dependency is proposed. Do not change hub URL conventions or the indexability threshold.

## Alternatives considered

1. **Keep independent homepage and hub copies:** simple initially, but answers drift and have no durable shared page.
2. **Attach only to exact hub URLs:** precise, but misses the requested inheritance to combinations; retain exact placement as an additional tool for migration and exceptions.
3. **Require all assigned facets to match:** more restrictive, but not the selected OR semantics. Editors must understand that multiple assignments broaden placement.
4. **Publish every saved FAQ automatically:** exposes incomplete answers and risks thin, repetitive pages; explicit editorial approval is safer.

## Migration and rollout plan

1. Inventory all existing homepage and hub FAQs and their exact current order and placement. Define deterministic, collision-checked new slugs, without altering unrelated URLs or fabricating full answers.
2. Create shared records as drafts. Copy each existing answer into the summary; leave the full answer incomplete until an editor writes and reviews it. Preserve homepage placement or use an exact hub placement for legacy items; do not infer facet tags that would broaden their reach.
3. Keep the existing public FAQ sources rendering during review. A draft shared record is not public; do not remove its legacy source yet. Migrate one entry atomically: publish the reviewed shared entry and remove its legacy counterpart in the same deployment, preserving its old placement and order. Render both sources during this transition without duplicate output. Ensure structured data matches the actually displayed source.
4. Compare built homepage and affected hub output before and after each migration, including question, summary, order, and structured data. The intentional new link and approved full page are the only expected visible additions. Do not bulk-publish copied summaries as full articles.
5. Once every legacy entry is migrated and verified, remove the legacy schema fields, readers and compatibility path in a subsequent scoped change. Keep rollback possible through versioned content and deployments; check sitemap and public links before rolling back a deployment that has already exposed FAQ URLs.

## Implementation and verification plan

1. Use controlled selectors and the build-time placement report; require a separate deployment decision before removing or redirecting a published URL.
2. Add domain and repository contracts with AAA tests: OR matching across facets and areas, exact placement, deduplication, deterministic ordering, empty selections, invalid values and slug collisions. Test published versus draft validation, and run the same contract against both repository implementations.
3. Add application view models and route listing. Test homepage, single-facet and pair/triple hubs, including both-area records, zero matches and noindex hubs; confirm existing 5/6-design hub boundaries remain unchanged. Test published-only blocks and FAQ routes, missing or incomplete records, and links only to indexable hubs.
4. Add Keystatic fields and incremental migration, then HTML and Markdown presentation. Test that summaries, full answers, links and canonicals agree across surfaces, that Markdown escapes content correctly, and that structured data represents visible content. Verify keyboard and no-JavaScript behavior.
5. Extend sitemap and `/llms.txt` discovery and timestamps. Build-smoke-test representative published and draft FAQs, noindex hubs, all linked Markdown files, sitemap exclusion of Markdown and drafts, and existing routes. Verify every published FAQ has one HTML page, one Markdown page and one llms entry, and no broken links.
6. Update `docs/overview.md` when the route and indexing changes actually ship. Run `npm run check`, `npm test` and `npm run build`; validate migrated content without inventing claims. Monitor Search Console indexing, relevant query impressions and clicks, and engagement with FAQ-to-hub links after release, treating any effect on topical authority as a hypothesis rather than a guaranteed outcome.

## Consequences and open questions

- OR inheritance is easy to understand but can spread generic content widely; editorial review and placement audits are essential.
- Publishing adds two static outputs per FAQ and more build work. Measure build time and the number of placements as content grows.
- Exact placements can become stale as generated hubs disappear; the build must report those references for editorial correction.
- A custom live admin preview and automated redirects are not included; revisit them if the editorial workflow requires them.
