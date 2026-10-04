# Nail.ai

Astro project for discovering manicure and pedicure ideas. See [docs/overview.md](docs/overview.md) for the planned URL structure.

## Requirements

- Node.js 22.19 or newer
- npm

## Development

```sh
npm install
npm run dev
```

Open the site at `http://localhost:4321` and the Keystatic editor at `http://localhost:4321/keystatic`.

Keystatic is configured with local storage. Entries are saved under `src/content/ideas/`; configure GitHub storage before enabling the editor on a hosted deployment.

## Checks

```sh
npm run check
npm test
npm run build
```