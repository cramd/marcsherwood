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

`sebring.marcsherwood.com` stays on the homelab Caddy server (`apps/sebring`). DNS must be **`sebring`** (not `seabring`): proxied **A** → homelab WAN IP (`207.6.231.172`), **not** a CNAME to apex/Pages. Run `CF_API_TOKEN=… npm run dns:sebring` to apply via API.

## Homelab-only scripts

- `npm run deploy:homelab:legacy` — old apex rsync (emergency only)
- `npm run deploy:homelab:sebring` — Sebring subdomain
- `npm run deploy:pages` — direct upload to Pages (GitHub Actions or Git integration is preferred)
- `CF_API_TOKEN=… npm run dns:pages` — apex + www CNAME to `marcsherwood.pages.dev` (leaves `sebring` alone)

### GitHub Actions (why you got failure emails)

The workflow **builds on every push to `main`** (should be green). **Deploy runs only when you use “Run workflow”** in Actions, because the repo needs a secret that is not set yet.

**One-time setup**

1. Cloudflare → **My Profile** → **API Tokens** → **Create Token** → use template **Edit Cloudflare Workers** or custom with:
   - **Account** → Cloudflare Pages → **Edit**
   - **Account** → **Account Settings** → **Read**
2. GitHub → **cramd/marcsherwood** → **Settings** → **Secrets and variables** → **Actions** → New secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: paste the token
3. Or locally: `gh secret set CLOUDFLARE_API_TOKEN -R cramd/marcsherwood` (paste when prompted)
4. **Actions** → **Deploy Cloudflare Pages** → **Run workflow** to deploy.

After the secret exists, you can change the workflow so `deploy` also runs on `push` if you want auto-deploy on every commit.

Until then, production is still served by Cloudflare Pages from the last successful Wrangler deploy; failed Actions runs do not take the site offline.