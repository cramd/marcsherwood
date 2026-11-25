# Interactive business card — terminal 01

## Deployment

The Astro route is `src/pages/card.astro`; the existing layout, navigation, styles and home page are unchanged. The existing Cloudflare Pages build (`npm ci && npm run build`) emits `dist/card/index.html` plus the vCard and QR assets. Merge the review branch to `main` only after checking the Cloudflare preview. Confirm `/card/`, `/card/marc-sherwood.vcf`, and `/card/qr.svg` respond on production.

## Entry points

- NFC NDEF URL: `https://marcsherwood.com/card/?src=nfc`
- Printed QR: `https://marcsherwood.com/card/?src=qr`
- Direct or shared link: `https://marcsherwood.com/card/`

Write the NFC tag as a URL record, read it back before installing, and leave the tag writable until the prototype works. Scan with the phone against the rear plate. The QR has a white quiet zone; do not trim it.

## PostHog

Set `PUBLIC_CARD_POSTHOG_KEY` to the project's **public project token** (not a personal API key) and `PUBLIC_CARD_POSTHOG_HOST` to its ingestion host (default `https://us.i.posthog.com`; use `https://eu.i.posthog.com` for EU). These are build-time Cloudflare Pages variables. Rebuild after setting them. For the manual GitHub deployment workflow, make sure equivalent public build variables are available in its build step. No events are sent before the visitor opts in; with no token the page works and the analytics control is hidden. No cookies, replay, autocapture or persistent visitor ID are used. PostHog may still receive ordinary HTTP metadata such as IP address; review your privacy notice and hosting settings before launch.

| Event | Properties |
| --- | --- |
| `card_view` | `source`: nfc, qr, direct |
| `card_journey_selected` | source, journey: hire, consult, curious |
| `card_action` | source, action, journey (when applicable) |

Suggested funnel: card_view → card_journey_selected → card_action. Break down by source and journey. Because of opt-in, totals are not a measure of all visits.

## QA checklist

- Test iPhone and Android NFC and QR entry, including camera, with token assembled.
- Expand each of the three journeys, check destination links, test keyboard and screen-reader navigation.
- Download the vCard, open it in Contacts, confirm name and public contact address.
- On a configured deployment, opt in and check PostHog Live Events for each entry source and action; opt out and confirm no additional events arrive.
- Share from phone; test desktop clipboard fallback.
- Verify existing site home, CV, GTM and AI operations routes remain available.
