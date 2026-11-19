# Cloudflare Pages — marcsherwood.com

Production deploys are triggered by pushes to **`main`** on [cramd/marcsherwood](https://github.com/cramd/marcsherwood).

## Build settings

| Setting | Value |
|--------|--------|
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | `22` (see `.nvmrc`) |

## Custom domains

- `marcsherwood.com`
- `www.marcsherwood.com` (redirects to apex via `public/_redirects`)

`sebring.marcsherwood.com` stays on the homelab Caddy server (`apps/sebring`).

## Homelab-only scripts

- `npm run deploy:homelab:legacy` — old apex rsync (emergency only)
- `npm run deploy:homelab:sebring` — Sebring subdomain
- `npm run deploy:pages` — direct upload to Pages (GitHub Actions or Git integration is preferred)
- `CF_API_TOKEN=… npm run dns:pages` — apex + www CNAME to `marcsherwood.pages.dev` (leaves `sebring` alone)

### GitHub auto-deploy

Add repository secret `CLOUDFLARE_API_TOKEN` (Pages: Edit + Account read). Pushes to `main` run `.github/workflows/cloudflare-pages.yml`.

Alternatively: Workers & Pages → **marcsherwood** → Connect to Git → `cramd/marcsherwood`.