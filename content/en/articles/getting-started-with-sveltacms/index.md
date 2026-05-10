---
title: Getting Started with Sveltia CMS
date: 2026-04-07T00:00:00+05:30
lastmod: 2026-04-07T00:00:00+05:30
draft: false
description: Sveltia CMS is a modern, Git-based headless CMS built for Jamstack sites. Learn what it is, how it compares to Netlify/Decap CMS, and how to connect it to your Hugo site in minutes.
author: Admin
categories:
  - Tech
tags:
  - cms
  - sveltia
  - jamstack
  - hugo
  - git
image: images/sveltia-logo.svg
image_caption: ''
toc: true
comments: true
---

## Introduction

If you've built a static site with Hugo, Astro, or Eleventy, you've likely run into the content editing problem: your site is fast and secure, but non-technical editors have no way to add or update content without touching Markdown files and Git commits.

That's what a Git-based CMS solves. And **Sveltia CMS** is one of the best options available today — a free, open-source, browser-based content editor that commits directly to your Git repository, with no server, no database, and no monthly bill.

<!--more-->

## What is Sveltia CMS?

[Sveltia CMS](https://sveltiacms.app/en/) is a headless content management system that runs entirely in the browser. Editors visit your site's `/admin` page, log in via GitHub (or GitLab), and get a clean UI for creating and editing content. Under the hood, every save is a Git commit to your repository.

It is the de facto successor to **Netlify CMS** (now called Decap CMS), addressing hundreds of longstanding issues — slow load times, broken media handling, poor i18n support — while staying largely compatible with the existing `config.yml` format. If you're already on Netlify/Decap CMS, migration is mostly a drop-in replacement.

Key characteristics:

- **Framework-agnostic** — works with Hugo, Astro, Eleventy, Jekyll, and others
- **Git-based** — no external database; your content lives in your repo
- **Browser-only** — no backend process to run or maintain
- **i18n-first** — built-in multi-language support from day one
- **Fast** — the editor itself loads in milliseconds

## How It Compares

| Feature | Sveltia CMS | Decap CMS | Forestry / Tina |
|---|---|---|---|
| Open source | Yes | Yes | Partial |
| Backend required | No | No | No |
| i18n support | Excellent | Limited | Limited |
| Media handling | Improved | Buggy | Good |
| Activity | Active | Minimal | Active |
| Cost | Free | Free | Free tier |

Sveltia CMS is the clear upgrade path from Decap CMS for most Jamstack projects.

## Setting Up Sveltia CMS with Hugo

### 1. Create the admin files

Add two files inside your `static/admin/` folder:

**`static/admin/index.html`**

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
</head>
<body>
  <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
</body>
</html>
```

**`static/admin/config.yml`**

```yaml
backend:
  name: github
  repo: your-username/your-repo
  branch: main

media_folder: static/images
public_folder: /images

collections:
  - name: articles
    label: Articles
    folder: content/articles
    create: true
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Date, name: date, widget: datetime }
      - { label: Description, name: description, widget: text }
      - { label: Body, name: body, widget: markdown }
```

### 2. Enable the OAuth app on GitHub

Sveltia CMS authenticates editors via OAuth. You have two options:

**Option A — Netlify Identity (simplest)**
If your site is deployed on Netlify, enable Identity in your site settings and Sveltia CMS will work with no extra config.

**Option B — Cloudflare Workers (self-hosted)**
For GitHub Pages or Cloudflare Pages deployments, deploy the [Sveltia CMS Auth](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker and point your config at it:

```yaml
backend:
  name: github
  repo: your-username/your-repo
  branch: main
  base_url: https://your-worker.your-subdomain.workers.dev
```

### 3. Configure your Hugo content collections

The `collections` block in `config.yml` maps directly to your `content/` folders. For a Hugo site with `content/articles/` using page bundles, a typical collection looks like:

```yaml
collections:
  - name: articles
    label: Articles
    folder: content/articles
    create: true
    path: "{{slug}}/index"
    media_folder: images
    public_folder: images
    fields:
      - { label: Title,       name: title,       widget: string }
      - { label: Date,        name: date,         widget: datetime }
      - { label: Description, name: description,  widget: text }
      - { label: Draft,       name: draft,        widget: boolean, default: false }
      - { label: Author,      name: author,       widget: string }
      - { label: Tags,        name: tags,         widget: list }
      - { label: Image,       name: image,        widget: image, required: false }
      - { label: Body,        name: body,         widget: markdown }
```

The `path: "{{slug}}/index"` setting tells Sveltia CMS to create page bundle directories (`content/articles/my-post/index.md`) instead of flat files — matching Hugo's page bundle structure.

## The Editorial Workflow

Once configured, editors can:

1. Navigate to `yoursite.com/admin`
2. Log in with their GitHub account
3. Pick a collection (Articles, News, etc.) from the sidebar
4. Create or edit entries in a rich Markdown editor
5. Click **Publish** — Sveltia CMS commits directly to your repo, triggering your CI/CD pipeline

Drafts are saved as Git branches if you enable the editorial workflow:

```yaml
publish_mode: editorial_workflow
```

This gives you a proper review process: Draft → In Review → Ready → Published.

## Conclusion

Sveltia CMS slots cleanly into a Hugo + GitHub Pages or Cloudflare Pages workflow. It gives non-technical editors a polished editing interface while keeping your content fully version-controlled in Git — no vendor lock-in, no monthly subscription, and nothing to self-host beyond a small auth proxy.

If you're already using Decap CMS, migrating is largely a matter of swapping the script tag and testing your existing `config.yml`. For new projects, it's the simplest way to add a content editor to any Jamstack site today.

---

**References:**

- [Sveltia CMS Documentation](https://sveltiacms.app/en/docs)
- [Sveltia CMS GitHub Repository](https://github.com/sveltia/sveltia-cms)
- [Migrating from Netlify/Decap CMS](https://sveltiacms.app/en/docs/migration/netlify-decap-cms)
- [Sveltia CMS Auth (Cloudflare Worker)](https://github.com/sveltia/sveltia-cms-auth)
