# LLM content

This document describes the static LLM-facing representation of Nail.ai.
The AI presentation layer is implemented as static build-time output. The human-facing
pages and sitemap remain the source for currently published routes.

## `/llms.txt` site index

`/llms.txt` is a concise Markdown index that helps language models discover the
site's useful pages. Follow the format described at
[llmstxt.org](https://llmstxt.org/):

- Start with one H1 containing the site name (`Nail.ai`).
- Add a short blockquote describing the site's manicure and pedicure ideas.
- Organize links under H2 headings by area, such as `Manicure` and `Pedicure`.
- Link to each indexable hub page's Markdown representation, with its page-specific
  title and description from the shared hub view model. Do not include every possible
  facet combination; include only hubs that pass the site's shared indexability rule.
- Keep the index focused on content pages. Do not add navigation, promotional copy,
  or links that are not useful to an LLM.

Example shape (illustrative; URLs and page descriptions must come from the site's
route builder and page view models):

```md
# Nail.ai

> Find manicure and pedicure ideas, with designs organized by style and attributes.

## Manicure

- [Almond nails](<markdown URL>): Ideas for almond-shaped nail designs.
- [Nude nails](<markdown URL>): Nude nail designs across available styles.

## Pedicure

- [Pedicure page](<markdown URL>): Pedicure ideas and designs.
```

Descriptions should summarize the linked page, not repeat a generic site-wide
sentence. Omit an area section when it has no indexable pages.

## Markdown representation for each page

Every indexable hub page has its own standalone Markdown representation at
`/{area}/{slug}.md` (for example, `/manicure/almond-nails.md`). The Markdown page
provides the same
useful content as its HTML page, in a clean format that can be read without the
website's navigation or layout.

Each page should contain, in this order:

1. An H1 with the page's title.
2. The page's description and curated or generated introduction.
3. A short context section identifying its area and the relevant facet or
   combination, when useful.
4. The page's designs, using the same design names, descriptions, and ordering as
   the human-facing page. Link to canonical image or source URLs only when those
   are present in the page view model.
5. Related indexable hubs, if provided by the view model.
6. A link to the canonical HTML page.

Example shape:

```md
# Almond Nails: Nail Design Ideas

> Page description from the page view model.

Introductory copy from the page view model.

## Almond nail designs

- [Image title](image URL): Image alt

## Related ideas

- [Related hub](canonical URL)

View the [canonical HTML page](canonical HTML URL).
```

The example is structural, not fixed page copy. Use the actual title, description,
intro, designs, related hubs, and canonical URL returned for each page; do not
invent facts or duplicate generic copy across pages. Do not include HTML tags,
scripts, ads, site navigation, or content that is absent from the shared view
model.

## Inclusion, URLs, and rendering

- Reuse the same application services and page view models used by the human
  presentation. Do not create a second content service or independently rebuild
  page content.
- Use the existing route builder, canonical `SITE_URL`, and single indexability
  rule. Include all eligible hub routes; exclude noindex hubs from both `/llms.txt`
  and individual Markdown files.
- Render both the index and page representations as static build-time output.
- Keep Markdown rendering as a pure presentation-layer function. Astro endpoints
  should only wire services to the renderer and return its output.
- The `.md` URL scheme is `/{area}/{slug}.md`. Every `/llms.txt` page link uses
  this route and resolves to a generated file.
- Do not add `/llms-full.txt` unless it is explicitly requested.

The production smoke test checks parity with the sitemap: every indexable hub
route has one Markdown file and one index entry, and no noindex hub appears in
either output.
