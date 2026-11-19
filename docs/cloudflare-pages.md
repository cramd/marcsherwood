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

`sebring.marcsherwood.com` stays on the homelab Caddy server (`apps/sebring`). DNS must be a **proxied A record** to the homelab public IP (`207.216.8.150` — same as `fuzzynacho.org`), **not** a CNAME to apex/Pages. After apex cutover, run `CF_API_TOKEN=… npm run dns:sebring` if the site shows Cloudflare **522**.

## Homelab-only scripts

- `npm run deploy:homelab:legacy` — old apex rsync (emergency only)
- `npm run deploy:homelab:sebring` — Sebring subdomain
- `npm run deploy:pages` — direct upload to Pages (GitHub Actions or Git integration is preferred)
- `CF_API_TOKEN=… npm run dns:pages` — apex + www CNAME to `marcsherwood.pages.dev` (leaves `sebring` alone)

### GitHub auto-deploy

Add repository secret `CLOUDFLARE_API_TOKEN` (Pages: Edit + Account read). Pushes to `main` run `.github/workflows/cloudflare-pages.yml`.

Alternatively: Workers & Pages → **marcsherwood** → Connect to Git → `cramd/marcsherwood`.