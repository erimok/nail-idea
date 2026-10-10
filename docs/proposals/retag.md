# Retag Proposal

Draft audit from the current YAML taxonomy. Nothing in this proposal has been applied. Confirm every suggested tag against the source photo before editing content. The current data has four records with more than 14 occasions (not five as assumed in the audit notes).

| Record | Current issue | Proposed editorial action |
| --- | --- | --- |
| `almond-nails-with-micro-french` | 14 occasions and 4 seasons | Reduce to no more than 4 supported occasions and 2 seasons; review everyday, office, wedding, and vacation against the photo/use case. |
| `french-manicure-with-white-and-nude-colors-almond-nails` | 18 occasions and 4 seasons | Keep up to 4 relevant occasions (candidate: wedding, everyday, office, graduation) and 1–2 seasons only if the image has seasonal cues. |
| `short-almond-nails-with-micro-french` | 16 occasions and 4 seasons; alt says oval while `shape` says almond | Resolve nail shape from the image. Reduce occasions to at most 4 (candidate: everyday, office, date night, wedding) and seasons to at most 2. |
| `short-square-nails-with-solid-color` | 22 occasions and 4 seasons | Reduce to at most 4 supported occasions (candidate: everyday, office, interview, wedding) and 1–2 seasons only if the photo indicates seasonality. |
| `long-almond-nails-with-french` | Both `french` and `micro french`; 4 style values including `press-on` | Inspect tip width and select one French style. Keep only the primary visible style plus at most one secondary style; move `press-on` to a separate format field if the image establishes it. |
| `long-aqua-french` | Both French styles; image description says matte, record says glossy; aqua is represented as blue + nude | Verify finish and color from the photo. Candidate correction is matte + aqua if visibly supported; select one French style based on tip width. |
| `long-multicolor-glossy-french` | Both `french` and `micro french` | Select one style after checking the tip width; retain the multicolor and glossy tags only if visible. |
| `medium-squoval-nails-with-micro-french` | Both French styles and 4 seasons | Keep `micro french` only if the tip line is genuinely narrow; reduce seasons to at most 2 or none if the photo is not seasonal. |
| `short-oval-nails-with-micro-french` | Both French styles | Verify tip width and retain either `micro french` or `french`, not both. |
| `long-almond-nails-with-solid-multi-color` | 4 style values including `press-on` and `solid` | Keep the visible primary style and at most one secondary style; separate press-on format from style if confirmed by the image. |
| `long-almond-nails-with-solid-color` | `freestyle` and `solid` style labels; description says multicolor | Verify whether the set is solid or multicolor and align the title, description, and tags. |
| `long-squoval-nails-with-solid` | 6 occasions; cat-eye and matte finishes together | Reduce occasions to at most 4 and verify whether the photo visibly combines both finishes. |
| `matte-solid-burgundy` | Near-duplicate of `burgundy-matte-finish` (short squoval vs short square); 5 occasions | Preserve the shape distinction if the photos confirm it; reduce occasions to at most 4. |
| `nude-milky-squoval-micro-french` | 3 seasons; color tags nude + silver with chrome finish | Reduce seasons to at most 2 and verify whether silver is a visible base color or only a chrome effect. |
| `burgundy-matte-finish` | Near-duplicate of `matte-solid-burgundy` | Keep only if the short square shape is visibly distinct from the short squoval entry. |

No current `colors` list contains `solid`; the `solid` value occurs under `types`. The planned taxonomy change should remove `solid` from the style enum only after these entries have an approved replacement.
