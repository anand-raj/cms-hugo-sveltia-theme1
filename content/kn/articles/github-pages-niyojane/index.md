---
title: "GitHub Pages ಮೂಲಕ ನಿಮ್ಮ Hugo ಸೈಟ್ ಅನ್ನು ಉಚಿತವಾಗಿ ನಿಯೋಜಿಸಿ"
date: 2026-04-15T09:30:00+05:30
lastmod: 2026-04-15T09:30:00+05:30
draft: false
description: "GitHub Pages ಮತ್ತು GitHub Actions ಬಳಸಿ Hugo ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ಉಚಿತವಾಗಿ ಇಂಟರ್ನೆಟ್‌ಗೆ ಪ್ರಕಾಶಿಸುವ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ."
author: "ಸಂಪಾದಕ"
categories: ["ತಂತ್ರಜ್ಞಾನ"]
tags: ["hugo", "github-pages", "github-actions", "deployment", "git"]
toc: true
comments: true
priority: "tertiary"
---

Hugo ಮೂಲಕ ನಿರ್ಮಿಸಿದ ವೆಬ್‌ಸೈಟ್ ಅನ್ನು GitHub Pages ಬಳಸಿ ಉಚಿತವಾಗಿ ಲೈವ್ ಮಾಡಬಹುದು. GitHub Actions ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತ ನಿಯೋಜನೆ ಸಾಧ್ಯ — ಪ್ರತಿ ಬಾರಿ ನೀವು ಬದಲಾವಣೆ ಪ್ರಕಾಶಿಸಿದಾಗ ಸೈಟ್ ತಾನಾಗಿ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ.

<!--more-->

## ಮೊದಲ ಹಂತ: GitHub Repository ರಚಿಸಿ

1. [github.com](https://github.com) ಗೆ ಹೋಗಿ ಲಾಗಿನ್ ಮಾಡಿ
2. ಹೊಸ repository ರಚಿಸಿ — ಹೆಸರು: `username.github.io`
3. ನಿಮ್ಮ Hugo ಸೈಟ್ ಫೈಲ್‌ಗಳನ್ನು ಅಲ್ಲಿಗೆ push ಮಾಡಿ

```bash
git init
git add .
git commit -m "ಮೊದಲ ಕಮಿಟ್"
git remote add origin https://github.com/username/username.github.io.git
git push -u origin main
```

## ಎರಡನೇ ಹಂತ: GitHub Actions Workflow ರಚಿಸಿ

`.github/workflows/hugo.yml` ಫೈಲ್ ರಚಿಸಿ:

```yaml
name: Hugo ಸೈಟ್ ನಿಯೋಜನೆ

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Hugo ಸ್ಥಾಪಿಸಿ
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: ನಿರ್ಮಿಸಿ
        run: hugo --minify

      - name: GitHub Pages ಗೆ ನಿಯೋಜಿಸಿ
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

## ಮೂರನೇ ಹಂತ: GitHub Pages ಸಕ್ರಿಯಗೊಳಿಸಿ

1. Repository Settings → Pages ಗೆ ಹೋಗಿ
2. Source: `gh-pages` branch ಆಯ್ಕೆ ಮಾಡಿ
3. Save ಒತ್ತಿ

ಕೆಲ ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಸೈಟ್ `https://username.github.io` ನಲ್ಲಿ ಲೈವ್ ಆಗುತ್ತದೆ.

## ಸ್ವಂತ Domain ಸಂಪರ್ಕಿಸಿ

ಸ್ವಂತ ಡೊಮೇನ್ ಇದ್ದರೆ (ಉದಾ: `www.kannadablog.com`):

1. `static/CNAME` ಫೈಲ್ ರಚಿಸಿ, ಅದರಲ್ಲಿ ಡೊಮೇನ್ ಹೆಸರು ಬರೆಯಿರಿ
2. Domain registrar ನಲ್ಲಿ DNS CNAME ರೆಕಾರ್ಡ್ ಸೇರಿಸಿ
3. GitHub Pages Settings ನಲ್ಲಿ Custom Domain ಹೊಂದಿಸಿ

## ಸಾಮಾನ್ಯ ತೊಂದರೆಗಳು

**ಸೈಟ್ ಕಾಣಿಸುತ್ತಿಲ್ಲ:** `baseURL` ಸರಿಯಾಗಿ ಹೊಂದಿಸಲಾಗಿದೆಯೇ ಪರಿಶೀಲಿಸಿ.

**CSS ಲೋಡ್ ಆಗುತ್ತಿಲ್ಲ:** `hugo.toml` ನಲ್ಲಿ `baseURL = "https://username.github.io/"` ಎಂದು ಇರಬೇಕು.

**Build ವಿಫಲವಾಗಿದೆ:** Actions tab ನಲ್ಲಿ error ಲಾಗ್ ನೋಡಿ.

## ತೀರ್ಮಾನ

GitHub Pages ಮತ್ತು GitHub Actions ಸಂಯೋಜನೆ Hugo ಸೈಟ್‌ಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಉಚಿತ ಹೋಸ್ಟಿಂಗ್ ಆಯ್ಕೆ. ಒಮ್ಮೆ ಹೊಂದಿಸಿದ ನಂತರ ಪ್ರತಿ ಲೇಖನ ಪ್ರಕಟಣೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನಡೆಯುತ್ತದೆ.
