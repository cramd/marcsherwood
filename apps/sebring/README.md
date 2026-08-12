# Sebring Restoration Site

Father and son restoration tracker for the 1965 Ducati Sebring 350 at **sebring.marcsherwood.com** — **The Sherwoods**.

## Development

```bash
cd apps/sebring
npm install
cp .env.example .env   # add Firebase credentials
npm run dev
```

Manage background server: `astro dev stop`, `astro dev status`, `astro dev logs`.

## Deploy

**SSH/rsync to the Caddy server** — the only deploy path for this site.

```bash
npm run deploy          # build + rsync to root@192.168.0.62:/var/www/sebring.marcsherwood.com/
npm run deploy:rsync    # rsync only (when dist/ already built)
```

Requires home LAN or VPN to reach `192.168.0.62`. Caddy serves the static files; Firebase is backend-only (Firestore, Auth, Storage, Functions).

If SSH times out, the build still succeeds — connect to the network and run `npm run deploy:rsync`.

Ensure DNS and the `sebring.marcsherwood.com` site block are in `Caddyfile.remote`.

## Firebase setup

**Project:** `dvp-insight-platform` (DVP — billing enabled)

Admin requires Firebase (Auth, Firestore, Storage). Config lives in `.env` and `.firebaserc`.

```bash
cd apps/sebring
firebase login --reauth          # if CLI says credentials expired
npm run setup:firebase           # picks project, writes .env, deploys rules
```

Then enable **Google Sign-In** in Firebase Console → Authentication.

Enable **Google Photos Picker API** (required — one click):

https://console.developers.google.com/apis/api/photospicker.googleapis.com/overview?project=928125401687

Click **Enable**, wait 1–2 minutes, then retry the picker.

**“Google hasn’t verified this app”** — expected for a personal/family app. You do *not* need full Google verification unless strangers will sign in.

1. [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?project=dvp-insight-platform) → keep **Testing**
2. **Test users** → add `marcsherwood@gmail.com` and Dad’s Google email
3. When picking photos: **Advanced** → **Go to … (unsafe)** — that’s your own app

Add `sebring.marcsherwood.com` to Firebase Auth authorized domains if needed.

Then deploy Storage rules (note: use `storage`, not `storage:rules`):

```bash
firebase deploy --only storage
```

```bash
cd functions && npm install
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions
```

**Important:** `PUBLIC_*` env vars are embedded at build time. After creating `.env`:

```bash
npm run deploy
```

## Security — API keys

**Keys in use (Sebring only):**

| Key | Where | Secret? |
|-----|--------|---------|
| `PUBLIC_FIREBASE_API_KEY` | `.env` → baked into `dist/` on deploy | Public by design, but must be **referrer-restricted** in GCP |
| `GEMINI_API_KEY` | Firebase Functions secret (server-only) | Yes — never in repo or client |
| Google OAuth | Firebase Auth / Photos Picker | User tokens only; no client secret for web |

`.env` is gitignored. If a key appeared in chat, Cursor history, or an old deploy, rotate it.

**Rotate Firebase web key (run locally):**

```bash
cd apps/sebring
bash scripts/rotate-api-keys.sh
npm run deploy
```

That script creates a referrer-restricted key for `sebring.marcsherwood.com`, updates `.env`, and deletes the old Sebring key (`AIzaSyAO…` prefix). HuntMode keys are not touched.

**Also check:**

1. [GCP Credentials (dvp-insight-platform)](https://console.cloud.google.com/apis/credentials?project=dvp-insight-platform) — delete any duplicate “Sebring Site (rotated …)” keys if you ran rotation more than once
2. [Gemini API keys](https://aistudio.google.com/apikey) — revoke if you ever set `GEMINI_API_KEY`, then `firebase functions:secrets:set GEMINI_API_KEY`
3. **FuzzyNacho project** — a temporary “Sebring Site” web app was created during setup (`gen-lang-client-0845059369`). Delete it in [Firebase Console](https://console.firebase.google.com/project/gen-lang-client-0845059369/settings/general) if you are not using it, or restrict/delete its API key in GCP

**Note:** Firebase web API keys always appear in deployed JavaScript. Restriction (HTTP referrers + API allowlist) is what limits abuse — not hiding the string.

## Pages

- `/` — Hero + project health dashboard
- `/inventory` — Filterable parts catalog
- `/updates` — Build log (markdown + video embeds)
- `/reference` — Assembly codes + workshop guides
- `/admin` — Authenticated part capture + AI identify
