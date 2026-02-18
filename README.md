# trometer.com Replica

A fully responsive replica of [trometer.com](https://trometer.com) built with 11ty, Tailwind CSS, and Alpine.js.

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

## Development

```bash
npm run start
```

This runs Tailwind (builds CSS) and starts the Eleventy dev server. Open http://localhost:8080

## Project structure

- `src/` — Source files
- `src/_data/site.js` — Global site data
- `src/_includes/` — Layouts and partials
- `src/projects/` — Project markdown files
- `_site/` — Build output (generated)

## Adding embed URLs

Edit each project's front matter in `src/projects/*.md` and set `embedUrl` to your Vimeo or YouTube iframe `src` URL.
