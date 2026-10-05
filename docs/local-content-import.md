# Local Content Import

The local development server exposes `POST /api/dev/nails`. It accepts one JSON object matching a `Nails` collection entry and writes a YAML file under `src/content/nails/`.

Start the server with `npm run dev`. The examples below use `http://localhost:4321`; change the host or port if Astro reports a different URL.

## curl

The reusable payload in [`examples/nail-entry.json`](../examples/nail-entry.json) can be posted with:

```sh
curl --fail-with-body -X POST http://localhost:4321/api/dev/nails \
  -H 'Content-Type: application/json' \
  --data-binary @examples/nail-entry.json
```

On success, the endpoint returns `201` and the generated filename. Edit `title` and the image URL in the JSON before each import; the filename is derived from `title`.

## REST Client

Open [`examples/nails.http`](../examples/nails.http) in VS Code with the REST Client extension, start the dev server, then use **Send Request** above either request. Each request is a complete example with canonical collection values.

## Request Rules

- Send all fields from the `Nails` schema: `title`, `image`, `description`, `typesOfNails`, `colors`, `types`, `occasions`, `season`, `shape`, `length`, `finishes`, and `nailConcerns`.
- Use canonical values from [`src/libs/ai/vocabulary.ts`](../src/libs/ai/vocabulary.ts). Use empty arrays for multiselect fields with no tags.
- `image` must be an HTTP or HTTPS URL.
- The endpoint is available only in the Vite development server and only to local requests.
- A successful import returns `201`. Invalid JSON or fields return `400`; an existing title-derived filename returns `409` and is never overwritten.

To import several entries, send multiple requests from the `.http` file or run `curl` once per JSON payload. Update each title to a distinct value before sending; existing files are intentionally preserved.