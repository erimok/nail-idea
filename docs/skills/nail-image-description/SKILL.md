---
name: nail-image-description
description: Analyze an uploaded nail-design image and produce a Nails collection entry that matches the schema and controlled vocabulary included in this skill.
---

# Nail Image Description

Use this skill when the user provides an image of a manicure or pedicure and wants it described or prepared as a Nail.ai `nails` collection entry.

## Input

- Inspect the supplied image directly.
- Use an image URL supplied by the user as the `image` value. If the user supplied only an uploaded/local image and no URL, ask for the URL before producing a final collection entry. Never invent or infer a URL.
- If it is unclear whether the image shows a manicure or pedicure, ask the user. Otherwise use the visible nail service.

## Analysis

Describe only details that are visible in the image. Identify the dominant colors, design style, nail shape, length, and finish when they can be determined. Set `occasions`, `season`, and `nailConcerns` only when there is clear evidence; otherwise use empty lists. Do not infer a person's identity, health, or personal attributes from the image.

Use only the canonical values listed below. These are the complete allowed values for the collection; synonyms and other values are not valid output. If a detail is uncertain, omit it from a multiselect list. For uncertain single-select values, ask a concise follow-up rather than guessing.

## Allowed Values

- `typesOfNails`: `both`, `manicure`, `pedicure`
- `colors`: `apricot`, `blue`, `pink`, `beige`, `black`, `brown`, `burgundy`, `coral`, `cream`, `cyan`, `fuchsia`, `gold`, `green`, `gray`, `ivory`, `lavender`, `maroon`, `mint`, `navy`, `nude`, `olive`, `orange`, `peach`, `periwinkle`, `purple`, `red`, `rose gold`, `sage`, `silver`, `taupe`, `teal`, `turquoise`, `white`, `yellow`
- `types`: `3d`, `abstract`, `aura`, `builder gel`, `checkerboard`, `color block`, `flame`, `floral`, `freestyle`, `french`, `geometric`, `japanese manicure`, `marble`, `minimalist`, `negative space`, `ombre`, `polka-dot`, `press-on`, `russian manicure`, `skittle`, `swirl`, `tortoiseshell`, `watercolor`
- `occasions`: `anniversary`, `baby shower`, `bachelorette party`, `birthday`, `beach vacation`, `bridal shower`, `christmas`, `concert`, `date night`, `easter`, `everyday`, `festival`, `graduation`, `halloween`, `holiday`, `interview`, `mothers day`, `new year`, `office`, `party`, `prom`, `thanksgiving`, `vacation`, `valentines day`, `wedding`
- `season`: `autumn`, `spring`, `summer`, `winter`
- `shape`: `almond`, `coffin`, `duck`, `flare`, `lipstick`, `mountain peak`, `oval`, `round`, `squoval`, `square`, `stiletto`
- `length`: `short`, `medium`, `long`
- `finishes`: `cat-eye`, `glazed`, `holographic`, `iridescent`, `jelly`, `satin`, `sheer`, `velvet`, `chrome`, `glitter`, `glossy`, `matte`, `pearl`, `shimmer`
- `nailConcerns`: `bitten`, `brittle`, `damaged`, `peeling`, `ridged`, `sensitive`, `split`, `thin`, `weak`

The following recognized terms are aliases, not additional YAML values. When an image or user uses one of these terms, write its mapped canonical value in the YAML entry.

## Recognized Aliases

- `colors`: `baby blue` -> `blue`; `baby pink` -> `pink`; `grey` -> `gray`; `hot pink` -> `fuchsia`; `lilac` -> `lavender`; `magenta` -> `fuchsia`; `navy blue` -> `navy`; `neutral` -> `nude`; `off-white` -> `ivory`; `rosegold` -> `rose gold`; `sky blue` -> `blue`; `wine` and `wine red` -> `burgundy`
- `types`: `french manicure`, `french tip`, and `french tips` -> `french`; `japanese` and `japanese nail care` -> `japanese manicure`; `ombré` -> `ombre`; `polka dot` and `polka dots` -> `polka-dot`; `press on` -> `press-on`; `russian` -> `russian manicure`
- `occasions`: `baby-shower` -> `baby shower`; `bachelorette` -> `bachelorette party`; `birthday party` -> `birthday`; `beach holiday` -> `beach vacation`; `every day` -> `everyday`; `halloween party` -> `halloween`; `mother's day` and `mother’s day` -> `mothers day`; `new years eve`, `new year's eve`, and `nye` -> `new year`; `office appropriate` and `office wear` -> `office`; `work`, `work event`, and `workday` -> `office`; `valentine's day` and `valentine’s day` -> `valentines day`
- `season`: `fall` -> `autumn`
- `shape`: `ballerina` -> `coffin`
- `length`: `extra long` -> `long`; `extra short` -> `short`; `medium-length` -> `medium`
- `finishes`: `cat eye` -> `cat-eye`; `glazed donut` -> `glazed`; `high-gloss` and `shiny` -> `glossy`; `metallic` and `mirror` -> `chrome`
- `nailConcerns`: `bitten nails`, `nail biting`, and `nail-biting` -> `bitten`; `ridge`, `ridged nails`, `ridging`, and `ridges` -> `ridged`; `split nails` and `splitting` -> `split`; `thin nails` -> `thin`; `weak nails` and `weakness` -> `weak`

Write `title` as a concise, distinctive name for the design. Write `description` as one factual sentence describing its visible colors, pattern, and finish. Do not include unsupported claims or promotional language.

## Output

Once the image URL and any necessary clarifications are available, return exactly one YAML entry with this schema and field order. Do not include Markdown fences or extra commentary.

```yaml
title: <short design name>
image: <user-provided image URL>
description: <one-sentence visual description>
typesOfNails: <manicure | pedicure | both>
colors: []
types: []
occasions: []
season: []
shape: <canonical nail shape>
length: <short | medium | long>
finishes: []
nailConcerns: []
```

Quote YAML string values when needed for valid YAML. Every selected tag must exactly match one of the allowed values above; never add a new category value.