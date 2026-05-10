---
title: "How Search Works on This Site"
date: 2026-04-09T14:00:00+05:30
lastmod: 2026-04-09T14:00:00+05:30
draft: false
description: "A look under the hood at how the site's client-side search is built — using Hugo's JSON output, Fuse.js fuzzy matching, and zero backend infrastructure."
author: "Admin"
categories:
  - Tech
tags:
  - hugo
  - search
  - fuse.js
  - jamstack
toc: true
image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&fm=webp&q=80"
image_caption: "Photo by [Markus Winkler](https://unsplash.com/@markuswinkler) on [Unsplash](https://unsplash.com)"
priority: "secondary"
---

The search feature on this site runs entirely in the browser — no server, no database, no API calls after the first page load. Here is how it is built.

## The Problem with Search on Static Sites

Static sites like this one are just HTML, CSS, and JavaScript files served from GitHub Pages. There is no running server to accept a query, look something up in a database, and return results. Every traditional search solution assumes a backend exists.

The two common approaches for static sites are:

1. **External search services** — send your content to Algolia, Typesense, or similar. Fast and powerful, but adds a third-party dependency and often a cost.
2. **Client-side search** — build a search index at build time, ship it as a JSON file, and do the matching in the browser using JavaScript.

We use approach 2. It works well for a site of this size and keeps everything self-contained.

## Step 1 — The Search Index

During every Hugo build, a file called `index.json` is generated at the root of the site. It contains a flat array of every article, news item, and event:

```json
[
  {
    "title": "Cauvery Reservoir Levels at 62% as Summer Sets In",
    "description": "Water levels at Karnataka's four major Cauvery reservoirs...",
    "content": "Water levels at the four major Cauvery basin reservoirs...",
    "url": "/news/cauvery-water-levels/",
    "section": "news",
    "date": "Apr 7, 2026"
  }
]
```

This is powered by two changes to the Hugo configuration:

**`hugo.toml`** — tells Hugo to emit a JSON output for the home route:

```toml
[outputs]
  home = ["HTML", "RSS", "JSON"]
```

**`layouts/index.json`** — a Hugo template that loops over all regular pages and serialises them:

```go-html-template
{{- range where site.RegularPages "Section" "ne" "" -}}
  {{- $entry := dict
    "title"       .Title
    "description" .Description
    "content"     (.Plain | truncate 500)
    "url"         .RelPermalink
    "section"     .Section
    "date"        (.Date.Format "Jan 2, 2006")
  -}}
{{- end -}}
```

The index is regenerated on every build, so new content appears in search results automatically after the next deploy.

## Step 2 — The Search Page

A stub content file at `content/search.md` creates the `/search/` route:

```yaml
---
title: "Search"
layout: "search"
sitemap:
  disable: true
---
```

The `layout: "search"` frontmatter tells Hugo to render `layouts/_default/search.html` for this page instead of the default single template. The page is excluded from the sitemap since it has no indexable content of its own.

## Step 3 — Fuse.js in the Browser

[Fuse.js](https://www.fusejs.io/) is a lightweight (~24 KB) fuzzy-search library. It runs entirely in the browser. When you load `/search/`:

1. The page fetches `/index.json` — one HTTP request, cached by the browser after the first visit.
2. Fuse builds an in-memory index from the JSON data.
3. If a `?q=` parameter is present in the URL, the search runs immediately and results appear without any interaction.

The matching is weighted across three fields:

| Field | Weight | Reason |
|---|---|---|
| `title` | 60% | Strongest relevance signal |
| `description` | 30% | Editorial summary |
| `content` | 10% | Full-text fallback |

The `threshold: 0.35` setting means Fuse tolerates minor typos — searching for "coffe" will still surface the Coorg coffee article.

## Step 4 — Live Search as You Type

Once the index is in memory, every keystroke runs a fresh `fuse.search()` call. This is synchronous and instant — no debouncing is needed at this scale. The URL is updated in place via `history.replaceState()` without a page reload, so every search state is shareable and bookmarkable.

## Step 5 — The Sidebar Widget

The search input in the homepage sidebar is a plain HTML form that submits to `/search/?q=...` via `GET`. The search page then reads the `?q=` parameter on load and fires automatically. No JavaScript is needed on the homepage itself for the search widget to work.

## What This Does Not Do

- **No real-time index updates** — content added to the CMS only appears in search after the next GitHub Actions build and deploy. This typically takes under two minutes.
- **No phrase matching** — Fuse.js matches individual tokens, not exact phrases. For most editorial use cases this is fine.
- **No pagination** — all results are rendered at once. For a small to medium site this is adequate.

## Summary

| Component | Technology |
|---|---|
| Index generation | Hugo Pipes + Go templates |
| Index format | JSON (flat array) |
| Search library | Fuse.js v7 (CDN) |
| Hosting | GitHub Pages (static) |
| Backend required | None |

The entire search feature adds zero ongoing cost, zero infrastructure to maintain, and works offline once the index is cached.
