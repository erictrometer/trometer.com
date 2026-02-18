# trometer.com

Portfolio site for Eric Trometer — creative director, filmmaker, and production lead. Built as a statically generated Jamstack site with client-side filtering, dark mode, and a headless CMS integration for non-developer editing.

## Tech Stack

| Layer         | Tool                                                              |
| ------------- | ----------------------------------------------------------------- |
| SSG           | [Eleventy 3.x](https://www.11ty.dev/)                            |
| Templating    | [Nunjucks](https://mozilla.github.io/nunjucks/)                  |
| CSS           | [Tailwind CSS 3.x](https://tailwindcss.com/) + Typography plugin |
| JS            | [Alpine.js 3.x](https://alpinejs.dev/) (self-hosted)             |
| Images        | [@11ty/eleventy-img 5.x](https://www.11ty.dev/docs/plugins/image/) (WebP + JPEG, responsive `srcset`) |
| Font          | [Inter Variable](https://fontsource.org/fonts/inter) (self-hosted via Fontsource) |
| CMS           | [Pages CMS](https://pagescms.org/) (configured via `.pages.yml`) |

## Architecture & Directory Structure

```
trometer.com/
├── eleventy.config.js        # Eleventy config: plugins, filters, collections, passthrough copy
├── tailwind.config.js        # Tailwind: dark mode, custom colours, typography plugin
├── .pages.yml                # Pages CMS: content types, fields, media config
├── package.json
│
├── src/                      # ── Eleventy input directory ──
│   ├── _data/
│   │   ├── site.js           # Global: title, tagline, URL, email, footer
│   │   └── taxonomy.js       # Canonical roles & tags (single source of truth)
│   │
│   ├── _includes/
│   │   ├── base.njk          # Root HTML shell: <head>, SEO meta, scripts
│   │   ├── about.njk         # About layout (extends base, adds prose wrapper)
│   │   ├── project.njk       # Single-project layout (extends base)
│   │   ├── header.njk        # Site header with nav links & theme toggle
│   │   ├── footer.njk        # Site footer
│   │   └── project-card.njk  # Reusable project card (thumbnail, title, tags)
│   │
│   ├── css/
│   │   └── main.css          # @font-face, Tailwind directives, theme transitions, header blur
│   │
│   ├── js/
│   │   ├── theme.js          # Alpine themeToggle component + scroll-hide header
│   │   └── filter.js         # Alpine projectFilter component + FLIP animation
│   │
│   ├── images/
│   │   └── projects/         # Source images (auto-optimised at build time)
│   │
│   ├── projects/
│   │   ├── projects.11tydata.js  # Directory data: layout, tags, computed permalink
│   │   ├── curious-desert.md     # One file per project
│   │   └── ...
│   │
│   ├── index.njk             # Homepage: tagline, filter UI, project grid
│   ├── about.md              # About page (pure Markdown, layout handled by about.njk)
│   ├── 404.njk               # 404 page
│   ├── robots.njk            # robots.txt (generated)
│   └── sitemap.njk           # sitemap.xml (generated from collections.all)
│
└── _site/                    # ── Eleventy output (git-ignored) ──
```

## The Data Cascade

Eleventy merges data from multiple sources in a specific order (lowest to highest priority):

```
1. Global data        src/_data/site.js        → {{ site.title }}, {{ site.url }}
                      src/_data/taxonomy.js    → {{ taxonomy.roles }}, {{ taxonomy.tags }}

2. Directory data     projects/projects.11tydata.js
                      └── sets layout: "project.njk", tags: "project"
                      └── computes permalink from slug: /{slug}/

3. Front matter       Each .md file's YAML block overrides everything above.
                      title, slug, order, role, tags, videos, thumbnail, etc.

4. Collections        "projects"  → sorted by front matter `order` field
                      "nav"       → pages with `nav: true`, sorted by `navOrder`
```

**How a project page is built:**

1. `curious-desert.md` provides front matter (`title`, `slug`, `videos`, etc.)
2. `projects.11tydata.js` injects `layout: "project.njk"` and computes `permalink: /curious-desert/`
3. `project.njk` extends `base.njk` and renders videos, metadata, body content, and credits
4. `base.njk` wraps everything in the HTML shell with SEO tags, header, and footer
5. The `eleventyImageTransformPlugin` post-processes the HTML, converting any `<img>` to a responsive `<picture>` with optimised WebP + JPEG variants

## Development Workflow

### Prerequisites

- Node.js >= 18

### Install

```bash
npm install
```

### Development server

```bash
npm run dev
```

Starts the Eleventy dev server with live reload at `http://localhost:8080`. Tailwind CSS is rebuilt automatically after each Eleventy build via the `eleventy.after` hook.

### Production build

```bash
npm run build
```

Outputs to `_site/`. Tailwind output is minified. Images are optimised to WebP + JPEG at 400px and 800px widths.

### Debug & benchmarks

```bash
DEBUG=Eleventy* npm run build        # Verbose Eleventy logging
npx eleventy --bench                 # Per-file build time benchmarks
```

## Scalability Guidelines

### Adding a new project

Create `src/projects/{slug}.md`:

```yaml
---
title: Project Title
slug: project-slug
order: 14
role: directing
tags:
  - documentary
duration: PROJECT TITLE (12-min)
videos:
  - url: https://player.vimeo.com/video/123456789
  - url: https://player.vimeo.com/video/987654321
    label: Behind the Scenes
thumbnail: /images/projects/project-slug.png
image: /images/projects/project-slug.png
alt: Descriptive alt text
description: A concise SEO description under 180 characters.
credits: |
  Production credits with optional <a href="...">HTML links</a>.
date: 2026-01-15
---

Body content in Markdown.
```

No other files need editing. The directory data file handles layout and permalink. The homepage picks up the new project automatically via the `projects` collection.

### Adding a new page

1. Create the page file in `src/` (e.g. `src/contact.njk` or `src/contact.md`).
2. Set `layout: base.njk` in front matter. If the page needs a prose wrapper, create a layout in `_includes/` that extends `base.njk` (see `about.njk` as a pattern).
3. To add it to the site navigation, include `nav: true`, `navOrder: 2`, and `navTitle: contact` in front matter.

### Adding a new reusable component

1. Create the partial in `src/_includes/` (e.g. `testimonial-card.njk`).
2. The partial receives data through Nunjucks scope — set variables with `{% set %}` before `{% include %}`.
3. Keep partials purely presentational: no data fetching, no async shortcodes inside includes.

### Adding a new role or tag

1. Add the value to `src/_data/taxonomy.js`.
2. Add the same value to `.pages.yml` under the corresponding `select` field options.

Both files must stay in sync — `taxonomy.js` drives the build, `.pages.yml` drives the CMS UI.

## CMS Integration

The site is configured for [Pages CMS](https://pagescms.org/) via `.pages.yml` at the repository root. Non-developers can:

- Create, edit, and reorder projects (title, videos, tags, images, credits, body)
- Edit the About page body content
- Upload and manage images in `src/images/`

Fields that are computed or structural (`layout`, `permalink`, `nav`) are hidden from the CMS UI.
