# Edge Cases · Brejesh Balakrishnan

An engineering portfolio in three reading modes: the [Casebook](https://brejeshbalakrishnan.github.io/), [60 Seconds](https://brejeshbalakrishnan.github.io/60-seconds/), and [Archive](https://brejeshbalakrishnan.github.io/archive/). Next.js and React render all three as static pages. The demos replay measured or clearly labeled illustrative scenarios in the browser; they do not call model services.

## Run locally

```sh
npm ci
npm run dev
npm run verify
```

`npm run verify` checks lint and workbook data and writes the production export to `out/`. Serve that folder with a static server to test refreshes and old URLs.

## Update content

- Edit `content/content.xlsx` for project records and URLs, experience, credentials, contact, and search metadata. `npm run generate:content` validates and regenerates the JSON, sitemap, and robots file.
- Edit `content/casebook.ts` for short casebook beats, evidence, archive presentation, and decisions. Case records resolve project IDs and URLs from the workbook.
- Edit `content/casebook-demos.ts` for the replay scenarios. Label illustrative data and keep measured claims tied to their context.
- The site uses `public/resume.pdf` as supplied. Self-hosted font licenses live in `public/fonts/`.

## Review and publish

The Pages workflow builds a static review artifact on `codex/fable-portfolio`. Production is a separate manual run on `main` with the reviewed workflow run ID. Fast-forward `main` to the approved preview commit; the workflow refuses to deploy an artifact built from a different commit. GitHub Pages serves the exact exported files and remains the canonical host. Old static URLs use HTML refresh redirects with a visible fallback link.
