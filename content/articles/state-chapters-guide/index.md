---
title: "State Chapters: A Guide for Admins and State Editors"
date: 2026-04-27T10:00:00+05:30
lastmod: 2026-04-27T10:00:00+05:30
draft: false
description: "How the State Chapters feature works — from publishing content as a state editor to approving it for the main site as a national admin."
author: Admin
categories:
  - Guide
tags:
  - state chapters
  - workflow
  - cms
  - editorial
image: ""
image_caption: ""
toc: true
comments: false
states: []
---

The State Chapters feature lets regional editors publish articles, news, and events under their own state — and lets the national admin selectively surface approved content on the main site under a dedicated **State Chapters** section in the navigation.

This guide covers both roles: the **state chapter editor** and the **main site admin**.

---

## How it works — the big picture

Each state chapter has its own Git repository and CMS. When a state editor publishes content, it is stored in that state's repository. When the main site rebuilds, it pulls in content from all connected state repos and merges it. A **State Chapters** dropdown in the top navigation lets visitors browse content by state.

However, not every piece of state content automatically appears on the state chapter page of the main site. The national admin controls visibility by applying an approval tag (`state-chapter`) to specific items. This gives the main site editorial oversight without requiring state editors to have access to the main CMS.

---

## For State Chapter Editors

### Your CMS and repository

You publish content through your own CMS instance. For example, the Karnataka chapter editor works at:

```
https://anand-raj.github.io/cms-content-karnataka/admin/
```

Your content is saved to your state's GitHub repository (`cms-content-karnataka`). You do **not** need access to the main site's repository or CMS.

### Creating content

In your CMS you have three collections: **Articles**, **News**, and **Events**. These work the same as on the main site. Fill in the title, body, date, description, and any images.

Two fields are set automatically and require no action from you:

- **Section** — set to your state name (e.g. `Karnataka`). This is informational.
- **State** — set to your state slug (e.g. `karnataka`). This wires your content into the correct taxonomy on the main site.

You do not need to set these fields — they are hidden and pre-filled.

### Publishing triggers a rebuild

When you save and publish content (i.e. set **Draft** to off and merge to `main`), a GitHub Actions workflow automatically notifies the main site to rebuild. Within a few minutes, your content is fetched and included in the main site build. It will appear on the `/states/karnataka/` page **only if** the national admin has approved it (see next section).

### What state editors cannot do

- You cannot approve your own content for the state chapter page on the main site — that is the admin's role.
- You cannot edit content in other state repositories.
- You cannot change site-wide settings (colours, fonts, navigation).

---

## For the Main Site Admin

### How approval works

State content becomes visible on a state chapter page (e.g. `/states/karnataka/`) when it carries **both** of the following:

| Front matter field | Required value |
|--------------------|----------------|
| `states` | `[karnataka]` (set automatically by the state CMS) |
| `tags` | must include `state-chapter` |

The `states` field is written automatically by the state CMS — you do not need to set it. Your only action is to add or remove the `state-chapter` tag.

### Approving a piece of content

1. Open the main site CMS at `/admin/`.
2. Navigate to the relevant collection — **Articles**, **News**, or **Events**.
3. Find the item from the state (state content arrives after each state repo rebuild).
4. In the **Tags** field, add `state-chapter`.
5. Set **Draft** to off if it isn't already.
6. Save and publish. The next site build will surface it on the state chapter page.

### Removing approval

To remove a piece of state content from the state chapter page, simply remove the `state-chapter` tag in the CMS and publish. The item remains on the main site's global news/articles/events pages — it just no longer appears in the state chapter section.

### Adding a new state

When a new state chapter is ready to connect:

1. **`data/states.yml`** — add an entry:
   ```yaml
   - name: Tamil Nadu
     slug: tamil-nadu
     description: "News, events, and articles from the Tamil Nadu state chapter."
   ```
   The slug must be URL-safe (lowercase, hyphens). This is what appears in the dropdown and in the URL (`/states/tamil-nadu/`).

2. **`static/admin/config.yml`** — add the new state as an option to the `states` select field in all three collections (Articles, News, Events):
   ```yaml
   - { label: "Tamil Nadu", value: "tamil-nadu" }
   ```

3. **`.github/workflows/deploy.yml`** — add a fetch step for the new state repo:
   ```yaml
   - name: Fetch state content — Tamil Nadu
     run: |
       git clone --depth=1 https://github.com/anand-raj/cms-content-tamilnadu.git /tmp/tamilnadu
       [ -d /tmp/tamilnadu/content/articles ] && cp -r /tmp/tamilnadu/content/articles/. content/articles/ || true
       [ -d /tmp/tamilnadu/content/events ]   && cp -r /tmp/tamilnadu/content/events/.   content/events/   || true
       [ -d /tmp/tamilnadu/content/news ]     && cp -r /tmp/tamilnadu/content/news/.     content/news/     || true
   ```

4. Commit and push. The new state will immediately appear in the **State Chapters** dropdown.

### The State Chapters dropdown

The navigation dropdown is built automatically from `data/states.yml`. No template edits are needed when adding or removing states — only the data file needs to change.

---

## Content flow summary

```
State Editor publishes in state CMS
        │
        ▼
Content saved to state GitHub repo (e.g. cms-content-karnataka)
        │
        ▼
GitHub Action notifies main site → triggers rebuild
        │
        ▼
Main site deploy fetches all state repos and merges content
        │
        ├── Content appears on global /news/, /articles/, /events/ pages
        │
        └── If admin has added "state-chapter" tag
                │
                ▼
            Content appears on /states/karnataka/ chapter page
```

---

## Quick reference

| Task | Who | How |
|------|-----|-----|
| Write and publish state content | State editor | State CMS → set Draft = off |
| Approve content for chapter page | Main site admin | Add `state-chapter` to Tags in main CMS |
| Remove content from chapter page | Main site admin | Remove `state-chapter` tag in main CMS |
| Add a new state | Main site admin | Edit `data/states.yml`, CMS config, and deploy workflow |
| Change chapter page appearance | Main site admin | Edit `layouts/states/list.html` or `assets/scss/main.scss` |
