# Nail.ai Agent Instructions

Nail.ai is a programmatic SEO site (pSEO) for manicure and pedicure ideas.
Stack: TypeScript, Astro, Keystatic CMS, Vitest.

## Read first

- `docs/overview.md` is the source of truth for URL structure, hub indexing rules, and planned routes. Read it before touching routing, sitemap, or hub logic. Update it in the same change when route conventions change.
- `keystatic.config.ts` defines the content schema. Keep code and content in sync with it.

## Content copy conventions

Apply these rules to every task, not just to a single hub or example page:

- Write “micro French” in prose, with a capital F. Keep existing slugs lowercase and hyphenated, and do not change existing URLs or slugs.
- Use natural phrase order in titles and prose, such as “long almond nails,” not “Almond Long Nails.”
- Keep copy unique for each design. Do not repeat sentences, and never use “flawless.”
- Do not invent prices, durations, or claims beyond information supplied for the task or present in the source data.
- Put design-specific copy in content data and reusable templates/view models. Do not hard-code a one-off version for an individual page when the behavior belongs across hub pages.

## Commands

| Task | Command |
|---|---|
| Type/lint check | `npm run check` |
| Unit tests + sitemap smoke test | `npm test` |
| Production build | `npm run build` |
| Dev server (always background) | `npm run dev -- --background` |
| Dev server control | `astro dev status`, `astro dev logs`, `astro dev stop` |

Requires Node.js >= 22.19 and npm. Never run the dev server in the foreground; it blocks the session.

## Architecture: hexagonal (ports and adapters)

Business logic must not depend on Astro, Keystatic, the filesystem, or the network. Those are replaceable details at the edge.

### Layers and dependency rule

Dependencies point inward only: `adapters -> application -> domain`.

| Layer | Contains | May import | Must NOT import |
|---|---|---|---|
| `domain` | Entities, value objects, pure functions: `NailArea`/`isNailArea`, slug normalization, facet registry and combinations, slug-collision detection, hub indexability rules | Other domain code, the TS standard library, vetted pure npm libraries (see Reuse before build) | Astro, Keystatic, `fs`, `process.env`, `fetch`, any framework or I/O library |
| `application` | **Services** (use cases) that orchestrate domain logic through repository ports and return **presentation-agnostic view models**: build hub catalog, list routes, decide sitemap inclusion, resolve browse links, build structured data | `domain`, port interfaces | Concrete adapters, Astro, Keystatic, HTML or Markdown markup |
| `ports` | TypeScript interfaces only: repositories (`NailRepository`, `HubRepository`) and `SiteConfig` | `domain` types | Implementations |
| `adapters` | Driven: repository implementations (Keystatic, in-memory), env config. Driving: presentation layers (human HTML, AI Markdown), Astro pages, endpoints | Everything inward | Other adapters (no adapter-to-adapter calls) |
| composition root | The single place that wires repository implementations into services (`src/composition.ts`) | Everything | Business logic |

### Target structure

```txt
src/
  domain/              # pure logic, zero framework imports
  application/         # services (use cases) returning view models
  ports/               # repository and config interfaces
  adapters/
    keystatic/         # driven: repository implementations
    config/            # driven: SITE_URL and env
    in-memory/         # driven: repository fakes for tests
    presentation/
      human/           # driving: HTML renderers (Astro components)   [implemented]
      ai/              # driving: Markdown + llms.txt renderers       [NOT implemented]
  composition.ts       # wiring: repositories -> services
  pages/               # driving: Astro routes, wiring + presentation only
  components/          # driving: human presentation only
```

This is the target layout. Migrate toward it incrementally.

### Data access: repositories only

All communication with any data source goes through a repository interface in `ports/`. A data source is the Keystatic reader, Astro content collections (`getCollection`), the filesystem, a database, localStorage, or any external API.

- Services receive repository interfaces as arguments. They never import a data library or an adapter.
- Repositories are defined by what the application needs (`findNailsByArea`, `getHub(area, slug)`), not by the storage API. Return domain types, never CMS, ORM, or raw rows.
- Only repository implementations in `adapters/` may import `@keystatic/core/reader`, `astro:content`, `fs`, a DB client, or `fetch`. Mapping to domain types happens there.
- Nothing outside `adapters/` and `composition.ts` constructs a repository.
- Every repository has an in-memory implementation in `adapters/in-memory/` for tests.
- New data need means new repository method or interface first, then the service, then the implementation.
- Future features (likes, personal collections) start with their own repository port (for example `LikeRepository`) so the storage choice (browser, accounts, database) stays swappable.

### Astro files: wiring and presentation only

`.astro` files (pages, layouts, components, endpoints) and `astro.config.*` may only:

1. **Wire:** obtain services from `src/composition.ts`. They never instantiate repositories or adapters themselves.
2. **Call** one service per data need, passing route params.
3. **Present:** render the returned view model as markup, plus `getStaticPaths` that only maps service output to paths.

They must not contain: filtering, sorting, grouping, slug building, indexability checks, URL assembly, data-source imports (`astro:content`, Keystatic, `fs`, `fetch`), or conditionals on `area` or facet strings. If a page needs logic, it belongs in a service or domain function. The service returns a ready-to-render view model.

Quick test: if you can unit-test the logic without rendering Astro, it does not belong in an `.astro` file.

### Rules

- **Domain is pure.** Functions take data and return data. No I/O, no `Date.now()`, no `Math.random()`, no globals. Pass time and randomness in as parameters.
- **Constructor or argument injection.** Services receive ports as parameters. Never import an adapter inside a service.
- **One service per file**, named for the intent (`buildHubCatalog`, `resolveSitemapRoutes`), exposing one public function.
- **New feature order:** domain types and rules, then the repository port, then the service (view model), then the repository implementation, then composition wiring, then the presentation layer(s) and Astro page. Write tests at each step (see Testing).
- **Migration scope.** Move code to the new layout only in files you are already changing for the task. Do not do drive-by refactors or a big-bang restructure. Existing behavior must stay identical, and existing tests must stay green.
- **Fail loudly.** Invalid state (slug collision, unknown area) throws a typed error in the domain. Adapters and pages do not swallow it.

## Presentation layers: people and AI

The site serves the same content to two audiences through two presentation layers. Both are driving adapters that render the **same view models** from the **same services**. Neither contains business logic.

| Layer | Audience | Output | Status |
|---|---|---|---|
| Human | People in browsers | HTML pages (Astro components), JSON-LD, sitemap | **Implemented** |
| AI | LLMs, agents, AI search crawlers | `/llms.txt` index and one Markdown file per page | **NOT implemented. Do not build unless the task explicitly asks for it.** |

### Shared rules (both layers)

- **One view model per page, many renderers.** A service returns a presentation-agnostic view model (title, description, intro, designs, breadcrumbs, related hubs, canonical URL). The human layer renders it as HTML. The AI layer will render it as Markdown. Never build a second service or repository call for the AI layer.
- **Services never emit markup.** No HTML, no Markdown, no `<script>` tags in `domain` or `application`. Renderers live in `adapters/presentation/`.
- **Same facts everywhere.** Titles, descriptions, design lists, and URLs come from the view model, so the HTML and Markdown versions cannot disagree.
- **Same indexability rule.** The AI layer includes exactly the routes that the sitemap includes, decided by the single indexability function. A `noindex` hub never appears in `llms.txt` or as a `.md` file.
- **Canonical URLs only.** All links in either layer use the canonical origin from `SiteConfig` (`SITE_URL`) and the route builder. No hardcoded URLs.
- **Static output.** Both layers are prerendered at build time. No runtime generation.

### Human layer (implemented)

- Astro components and pages under `components/` and `pages/`, following "Astro files: wiring and presentation only".
- Responsible for HTML, styling, accessibility, `<head>` metadata, and JSON-LD built by the structured-data service.
- Components receive view-model fields as props. They do not compute URLs or decide indexability.

### AI layer (planned, not implemented)

Design it now so later work is additive. Do not create files for it until asked.

**Planned outputs**

| Output | Route | Content |
|---|---|---|
| Site index | `/llms.txt` | Markdown index following the llms.txt convention (https://llmstxt.org): an H1 with the site name, a short blockquote summary, then H2 sections with link lists (for example `manicure`, `pedicure`) pointing to the `.md` pages, each link with a short description |
| Page Markdown | one `.md` file per indexable hub, mirroring its HTML URL | Clean Markdown of the page: title, intro, facet context, list of designs, related hubs, canonical HTML URL |
| Optional full dump | `/llms-full.txt` | All page Markdown concatenated. Add only if requested |

**Rules for building it**

- Create a Markdown renderer in `adapters/presentation/ai/` that is a **pure function**: `renderPageMarkdown(viewModel): string` and `renderLlmsTxt(siteViewModel): string`. They take view models and return strings, with no I/O.
- Add the `llms.txt` and `.md` Astro endpoints as thin wiring: get the service from `composition.ts`, call the pure renderer, return the string. Endpoints hold no logic.
- Reuse the existing route builder and indexability function. Do not re-derive URLs or inclusion rules.
- Markdown must stand alone: no HTML tags, no site navigation, no ads or scripts. Each file starts with an H1 and links back to the canonical HTML page.
- Use a maintained package for Markdown serialization if it removes escaping bugs (see Reuse before build). Do not hand-concatenate strings if escaping is non-trivial. Wrap it in the renderer.
- The `.md` URL scheme is undecided. See "Ask before".
- Update `docs/overview.md` (routes section) and the "Planned routes" list below in the same change that implements it.

## Reuse before build

Do not invent custom solutions for problems that a well-maintained, well-tested npm package already solves. Writing your own parser, validator, slugifier, or schema builder adds bugs and maintenance cost.

### Procedure (before writing any non-trivial utility)

1. Check what the repo already has: `package.json`, existing helpers, Astro built-ins, and Astro integrations.
2. Search npm for an established package.
3. Vet it. Adopt only if all hold: actively maintained (recent releases), widely used, TypeScript types included or via `@types`, compatible license (MIT, Apache-2.0, BSD, ISC), works with ESM and Node 22, no heavy or unnecessary dependencies.
4. If adopted, wrap it. Expose it through one project function (or a port if it touches I/O), so the library stays swappable and DRY holds. Call sites never import the package directly.
5. Write a custom solution only if no suitable package exists, or the need is so small that a dependency costs more than it saves. State the reason in your summary.

### Layer rules for libraries

- `domain` may use pure, side-effect-free libraries only (string, date, validation, schema types). No I/O, no framework packages.
- Libraries that perform I/O (file, network, DB) belong in `adapters/` behind a port.
- Rendering libraries (HTML, Markdown serialization) belong in `adapters/presentation/`, never in `domain` or `application`.
- Never use a library in `application` or `domain` that pulls in Astro or Keystatic.

### Candidate areas for this project

Verify each is still the right choice at the time of use. These are starting points, not mandates.

| Need | Prefer | Notes |
|---|---|---|
| Structured data types (schema.org) | `schema-dts` | Typed JSON-LD objects for `ItemList`, `BreadcrumbList`, `CollectionPage`. Serialize with `JSON.stringify` inside one wrapper. |
| JSON-LD processing (expand, compact, frame, normalize) | `jsonld` | A JSON-LD processor, not a schema.org generator. Use only if you must transform or validate JSON-LD. Do not use it just to emit a script tag. |
| Sitemap | `@astrojs/sitemap` | Already used. Do not hand-write sitemap XML. |
| Content reading | `@keystatic/core/reader` | Only inside the Keystatic repository adapter. |
| Markdown output (AI layer) | A maintained Markdown serializer from the unified/remark ecosystem (for example `mdast-util-to-markdown`), or a well-tested alternative | Only in `adapters/presentation/ai/`. Search npm for an existing `llms.txt` generator before writing one, and vet it. |
| Slug generation | A maintained slugify package | Wrapped in the single `normalizeSlug`. It must reproduce the documented rules (lowercase kebab-case, `rose gold` -> `rose-gold`). Existing tests decide whether it is acceptable. |
| Runtime validation | `zod` | Validate repository inputs at the adapter boundary. Use it for config as well. |
| Dates | `date-fns` | Never hand-roll date math. |
| Tests | `vitest` | Already used. |

If a candidate does not exist in `package.json`, adding it is allowed under the vetting checklist above. Mention it in your summary.

## Design principles: SOLID and DRY

Apply these when writing or changing code. They serve readability and safe change, not ceremony. When a principle conflicts with the simplest working solution, choose the simpler one and say why in your summary.

### SOLID

**S: Single responsibility.** A module has one reason to change.
- Split domain code by concept: slug normalization, facet combination, collision detection, and indexability each get their own module.
- A function either computes or performs I/O, never both.
- A service builds a view model. A renderer turns it into one format. Never both in one module.
- If you describe a function with "and", split it.

**O: Open/closed.** Add behavior by adding code, not by editing branches.
- Facets are data, not `if/else` chains. Define them in one registry, for example `{ name, combinable }`. `color`, `type`, `shape`, `length`, `finishing` are combinable; `occasion`, `season` are single-facet only.
- Adding a facet or area must mean adding a registry entry, with no changes to combination, routing, or sitemap logic.
- Adding a presentation layer (such as the AI layer) must mean adding a new renderer, with no change to services or domain.
- Do not switch on `area` or facet strings inside services. Drive behavior from the registry.

**L: Liskov substitution.** Any implementation of a repository must be usable wherever its port is expected.
- The Keystatic repository and the in-memory fake must satisfy the same contract: same return shapes, same ordering guarantees, same errors.
- Write one shared contract test suite per repository port and run it against every implementation.
- Implementations never add preconditions or throw errors the port does not declare.

**I: Interface segregation.** Keep ports small and role-specific.
- No god repository. Prefer `NailRepository`, `HubRepository`, `SiteConfig` over one `ContentService`.
- A service depends only on the ports it actually calls.
- Read and write ports are separate. Today everything is read-only; keep it that way until writes are scoped.

**D: Dependency inversion.** High-level policy depends on abstractions.
- Enforced by the dependency rule, the repository rule, and the composition root. Do not bypass them with a "quick" direct import of Keystatic, `astro:content`, or `fs`.

### DRY

**Principle:** every piece of knowledge has one authoritative home. DRY is about knowledge, not identical-looking lines.

Single sources of truth for this project:

| Knowledge | Lives in | Never repeated in |
|---|---|---|
| Area list (`manicure`, `pedicure`) | `src/domain/areas.ts` | Pages, tests, config as string literals |
| Facet list and `combinable` flag | Facet registry in `domain` | Route code, sitemap code, components |
| Slug normalization | One `normalizeSlug` function | Adapters, pages, tests (import it) |
| Indexing threshold (6 designs) | One named constant, for example `MIN_DESIGNS_FOR_INDEX` | Conditions, tests, comments (import it) |
| Indexability decision | One domain function | Sitemap, browse links, page meta, `llms.txt`, `.md` endpoints |
| Page content (title, intro, designs, links) | One view model per page, built by a service | HTML components, Markdown renderers |
| URL building | One route builder in `domain` | Components, renderers, endpoints |
| Data access | Repository ports and implementations | Pages, services, components |
| Structured data (JSON-LD) building | One service or domain function using the chosen library | Pages, components |
| Canonical origin | `SITE_URL` via the config adapter | Hardcoded URLs |

Rules:
- Before writing a helper, search the codebase for an existing one. Reuse or extend it. Then check npm (see Reuse before build).
- **Rule of three:** tolerate duplication twice; extract on the third occurrence. Do not create an abstraction for two usages.
- Do not merge code that looks alike but changes for different reasons. Wrong abstraction costs more than duplication.
- Derive, don't copy: compute hub URLs, sitemap inclusion, browse links, and AI-layer inclusion from the same indexability function so they cannot disagree.
- Tests may repeat literals for clarity, but they must import constants and functions (`MIN_DESIGNS_FOR_INDEX`, `normalizeSlug`) rather than re-implement them. Use builders for repeated setup.
- No copy-pasted components. Extract shared markup into one component with props.
- `docs/overview.md` owns the route and indexing rules. This file summarizes them for speed. If they disagree, the overview wins, and you must fix this file.

## Testing: AAA for every feature

Every feature and every behavior change ships with tests. This includes bug fixes: write the failing test first, then the fix.

### AAA format

Each test has three visibly separated blocks, in this order, with a blank line between them:

1. **Arrange:** build inputs, fakes, and the system under test.
2. **Act:** perform exactly one action.
3. **Assert:** verify the outcome.

```ts
import { describe, it, expect } from 'vitest';

describe('normalizeSlug', () => {
  it('converts spaces to kebab-case', () => {
    // Arrange
    const input = 'Rose Gold';

    // Act
    const result = normalizeSlug(input);

    // Assert
    expect(result).toBe('rose-gold');
  });
});
```

### Test rules

- One Act per test. If you need two actions, write two tests.
- Test one behavior per test. Multiple `expect` calls are fine only if they verify the same outcome.
- Name tests as behavior: `it('excludes noindex hubs from the sitemap')`, not `it('works')` or `it('test 1')`.
- Use `describe` per unit; the `// Arrange`, `// Act`, `// Assert` comments are required.
- Tests are independent and deterministic. No shared mutable state, no ordering dependence, no real clock, network, or randomness.
- Use test data builders (`aNail({ color: 'nude' })`, `aHubViewModel()`) with sensible defaults, so each test shows only the fields that matter.
- Test behavior and outcomes, not implementation details. Do not assert on private functions or call counts unless the call is the behavior.
- Do not re-test third-party libraries. Test your wrapper's behavior and the mapping.
- Cover happy path, edge cases, and failure paths. For this project, always consider: empty input, the six-design indexing threshold boundary (5 vs 6), duplicate slugs, records marked for both areas, and the empty pedicure area.

### What to test where

| Layer | Test type | Dependencies |
|---|---|---|
| `domain` | Unit | None. No mocks, no fakes. |
| `application` (services) | Unit | In-memory repositories from `adapters/in-memory/` as fakes for ports. Assert on the view model. |
| `adapters` (repositories) | Integration + contract | Real library (for example Keystatic reader against fixture files). Verify the mapping to domain types. Run the shared repository contract suite. |
| `adapters/presentation` (renderers) | Unit | Pure functions: build a view model with a builder, render, assert on the output string. No Astro, no I/O. |
| Astro pages and routes | Build smoke | `npm test` sitemap check. Verify representative URLs and indexability in generated output. |

Prefer in-memory fakes over mocking libraries. Fakes implement the real port interface, so tests break when the contract changes.

**Presentation parity tests** (add when the AI layer is implemented):
- Every sitemap URL has a matching `.md` file and a `llms.txt` entry.
- No `noindex` route appears in `llms.txt` or as a `.md` file.
- For a given view model, the HTML and the Markdown contain the same title, description, and design list.
- Every link in `llms.txt` resolves to a generated file.

### Test placement

Co-locate tests with source as `*.test.ts`. Shared builders, fakes, and repository contract suites live in `adapters/in-memory/` or a `test/` helpers folder.

## Domain rules

These are easy to break. Check them whenever you touch routes, content, or SEO logic.

**Areas**
- Top-level areas are `manicure` and `pedicure`. Use the `NailArea` type and `isNailArea` guard from `src/domain/areas.ts`. Do not hardcode area strings.
- Records marked for both areas appear in both.

**Routes** (`/{area}/{slug}/`)
- Facets: `color`, `type`, `shape`, `length`, `finishing` (combinable into pairs and triples), and `occasion`, `season` (single-facet only).
- Pair and triple pages exist only when at least one nail matches the full combination.
- Slugs are lowercase kebab-case (`rose gold` -> `rose-gold`).
- All facet and combination slugs share one namespace per area. A collision must fail the build, so never silence that error.
- Slugs under `/{area}/` are reserved for hubs. Individual nail detail pages do not exist; do not add them.
- Planned, not implemented:
  - `/{area}/comparison/{type}-vs-{type}/`
  - `/{area}/guide/{type}/`
  - `/llms.txt` and one `.md` file per indexable page (AI layer, URL scheme to be decided)

**Indexing**
- A hub is indexable only if it has >= 6 matching designs AND a curated intro AND a meta description in the Keystatic `hubs` collection. Otherwise it is `noindex`.
- `noindex` routes are excluded from the sitemap, from internal browse links, and from the AI layer. The empty pedicure area stays `noindex` until it has content.

**Sitemap**
- The Astro sitemap integration discovers prerendered routes automatically. Do not maintain a manual route list.
- `SITE_URL` must match the canonical production origin.

## Engineering rules

- Prerender SEO pages statically. Use server rendering only when a route needs it. The Node adapter exists for Keystatic's admin UI.
- The `ideas` collection writes to `src/content/ideas/` using local storage. Do not enable hosted editing until GitHub storage is configured.
- Keep changes minimal and scoped to the request. Do not refactor unrelated code.
- Use strict TypeScript. No `any`; prefer `unknown` plus narrowing. Model states with union types rather than loose strings.

## Definition of done

Before reporting a task complete:
1. Every new or changed behavior has AAA tests at the correct layer. A bug fix includes a test that failed before the fix.
2. Dependency rule holds: `domain` and `application` import no Astro, Keystatic, `fs`, DB client, adapter, or renderer.
3. Repository rule holds: all data access goes through a repository port. No `.astro` file imports `astro:content`, Keystatic, `fs`, or `fetch`, or constructs a repository.
4. Astro files contain only wiring and presentation. No filtering, sorting, slug, URL, or indexability logic.
5. Presentation rule holds: services return view models with no HTML or Markdown. New page content is added to the view model once, so every presentation layer gets it. The AI layer was not built unless the task asked for it.
6. Reuse check: no hand-written solution where a vetted npm package fits. Any new dependency is wrapped and mentioned in the summary.
7. SOLID check: no module with two reasons to change, no new `switch` on area or facet strings, no repository implementation that breaks its contract, no oversized port.
8. DRY check: no duplicated knowledge. Constants, slug logic, URL building, and indexability are imported from their single home.
9. `npm run check` passes.
10. `npm test` passes.
11. `npm run build` succeeds, if routes, content, or config changed.
12. `docs/overview.md` is updated, if route or indexing behavior changed.
13. Your summary states what changed, which tests you added, which packages you added or rejected (with reason), which commands you ran, and any you could not run.

## Ask before

- Adding a dependency that fails any vetting criterion, is large, or overlaps one already installed. Vetted, wrapped, well-known packages do not need approval, but report them.
- Changing the Node adapter, storage mode, or `SITE_URL` handling.
- Changing slug format or the hub indexing threshold. Both affect live SEO.
- Starting the AI presentation layer, or choosing its `.md` URL scheme (for example `/{area}/{slug}.md` versus `/{area}/{slug}/index.md`). The scheme is a public contract once published.
- Implementing product ideas from the overview (likes, personal collections). They are not scoped yet.
- Moving code across layers in files unrelated to the task.
- Introducing a new abstraction, base class, or shared utility used by fewer than three call sites.

## Astro docs

Base: https://docs.astro.build. Consult the relevant page before working on:

- Routing, dynamic routes, middleware: /en/guides/routing/
- Components: /en/basics/astro-components/
- Framework components (React, Vue, Svelte): /en/guides/framework-components/
- Content collections: /en/guides/content-collections/
- Styling, Tailwind: /en/guides/styling/
- i18n: /en/guides/internationalization/