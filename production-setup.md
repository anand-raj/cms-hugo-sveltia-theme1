# Production Backend Setup (Custom Domain)

## Current state
- Repo: `anand-raj/cms-hugo-sveltia-theme1`
- Current live URL: `https://anand-raj.github.io/cms-hugo-sveltia-theme1/`
- Auth Worker: `https://sveltia-cms-auth.e-anandraj.workers.dev` (existing)
- No GitHub Actions workflow yet (manual builds only)
- No custom domain yet

> Replace `yourdomain.com` and `auth.yourdomain.com` throughout with your actual domain.

---

## Execution order

```
A (code) ─┐
           ├─→ C (Worker) ─→ D (DNS) ─→ E (GitHub Pages) ─→ F (verify)
B (OAuth) ─┘
```

A and B can be done simultaneously. C needs B first (Client ID/Secret). D and E need the domain purchased/transferred first.

---

## Phase A — Code changes

### A1. `config/production/hugo.toml`
Change `baseURL`:
```toml
baseURL = 'https://yourdomain.com/'
```

### A2. `static/admin/config.yml`
Three values to update:
```yaml
backend:
  base_url: https://auth.yourdomain.com

site_url: https://yourdomain.com/

media_folder: static/images   # fix wrong global fallback
public_folder: /images
```

### A3. `.github/workflows/deploy.yml` — new file
```yaml
name: Deploy Hugo site

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          fetch-depth: 0

      - uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: '0.160.0'
          extended: true

      - run: hugo --environment production --minify

      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
          cname: yourdomain.com
```

---

## Phase B — GitHub OAuth App

1. Go to: **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** anything (e.g. "CMS Hugo Site")
   - **Homepage URL:** `https://yourdomain.com/`
   - **Authorization callback URL:** `https://auth.yourdomain.com/callback`
3. Click **Register application**
4. Copy the **Client ID**
5. Click **Generate a client secret** — copy immediately (shown only once)

---

## Phase C — Cloudflare Worker (Sveltia Auth)

> Requires Phase B to be completed first.

### C1. Clone and deploy
```bash
git clone https://github.com/sveltia/sveltia-cms-auth
cd sveltia-cms-auth
npm install
npx wrangler login
npx wrangler deploy
```

### C2. Set secrets
```bash
npx wrangler secret put GITHUB_CLIENT_ID
# paste Client ID from Phase B

npx wrangler secret put GITHUB_CLIENT_SECRET
# paste Client Secret from Phase B
```

### C3. Add custom subdomain
Cloudflare Dashboard → **Workers & Pages** → your worker → **Settings → Triggers → Custom Domains** → Add `auth.yourdomain.com`.

Cloudflare auto-provisions TLS for the subdomain — no manual DNS record needed.

---

## Phase D — DNS setup

> Requires the domain to be purchased and nameservers pointed to your registrar or Cloudflare.

Add these records at your registrar or Cloudflare DNS:

| Type  | Name  | Value                  | Notes        |
|-------|-------|------------------------|--------------|
| A     | `@`   | `185.199.108.153`      | GitHub Pages |
| A     | `@`   | `185.199.109.153`      | GitHub Pages |
| A     | `@`   | `185.199.110.153`      | GitHub Pages |
| A     | `@`   | `185.199.111.153`      | GitHub Pages |
| CNAME | `www` | `anand-raj.github.io.` | www redirect |

> **Cloudflare users:** set the A records to **DNS only (grey cloud)**. GitHub Pages TLS cert provisioning fails if the Cloudflare proxy (orange cloud) is active on these records.

---

## Phase E — GitHub Pages settings

1. Repo → **Settings → Pages**
2. Source: branch `gh-pages`, folder `/ (root)`
3. **Custom domain:** enter `yourdomain.com` → Save
4. Wait for DNS check to go green (5–10 min; may take longer for DNS propagation)
5. Tick **Enforce HTTPS**

---

## Phase F — Verify

- [ ] Push a commit to `main` → **Actions tab** → green deploy run
- [ ] `https://yourdomain.com/` loads the site correctly
- [ ] `https://yourdomain.com/admin/` loads Sveltia CMS
- [ ] Click **Login with GitHub** → OAuth flow completes → CMS dashboard appears
- [ ] Create a test draft article → Publish → Actions re-deploys → article is live
- [ ] `https://www.yourdomain.com/` redirects to apex (or loads correctly)

---

## Files changed in Phase A

| File | Change |
|------|--------|
| `config/production/hugo.toml` | `baseURL` → custom domain |
| `static/admin/config.yml` | `base_url`, `site_url`, `media_folder`, `public_folder` |
| `.github/workflows/deploy.yml` | New file — CI/CD pipeline |
