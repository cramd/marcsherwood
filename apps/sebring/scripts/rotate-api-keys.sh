#!/usr/bin/env bash
# Rotate Sebring Firebase API keys after a suspected leak.
# Run from apps/sebring: bash scripts/rotate-api-keys.sh
#
# What this does:
# 1. Creates a new browser API key restricted to sebring.marcsherwood.com + localhost
# 2. Writes apps/sebring/.env with the new key (other Firebase vars unchanged)
# 3. Deletes the previous Sebring web API key (prefix AIzaSyAO...) if found
# 4. Reminds you to rebuild + redeploy (PUBLIC_ vars are baked into dist at build time)
#
# Does NOT touch HuntMode keys or GEMINI_API_KEY (Cloud Functions secret).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="dvp-insight-platform"
APP_ID="1:928125401687:web:2a6e6284d6245830c0c112"
OLD_KEY_PREFIX="AIzaSyAOzj9z"
ENV_FILE="$ROOT/.env"

echo "=== Sebring API key rotation ==="
echo "Project: $PROJECT_ID"
echo ""

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Error: gcloud CLI required."
  exit 1
fi
if ! command -v firebase >/dev/null 2>&1; then
  echo "Error: firebase CLI required."
  exit 1
fi

read -r -p "Create a NEW restricted API key and retire the old Sebring key? [y/N] " CONFIRM
if [[ "${CONFIRM,,}" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Creating restricted API key..."
CREATE_OUT="$(gcloud services api-keys create \
  --project="$PROJECT_ID" \
  --display-name="Sebring Site (rotated $(date +%Y-%m-%d))" \
  --allowed-referrers="https://sebring.marcsherwood.com/*,http://sebring.marcsherwood.com/*,http://localhost:4321/*,http://127.0.0.1:4321/*" \
  --api-target=service=identitytoolkit.googleapis.com \
  --api-target=service=securetoken.googleapis.com \
  --api-target=service=firestore.googleapis.com \
  --api-target=service=firebasestorage.googleapis.com \
  --api-target=service=firebaseinstallations.googleapis.com \
  --api-target=service=firebase.googleapis.com \
  --format=json)"

NEW_KEY_RESOURCE="$(node -e "console.log(JSON.parse(process.argv[1]).name)" "$CREATE_OUT")"
NEW_KEY="$(gcloud services api-keys get-key-string "$NEW_KEY_RESOURCE" --project="$PROJECT_ID" --format='value(keyString)')"

SDK_JSON="$(firebase apps:sdkconfig WEB "$APP_ID" --project "$PROJECT_ID" --json)"
node -e "
const sdk = JSON.parse(process.argv[1]).result.sdkConfig;
const newKey = process.argv[2];
const lines = [
  '# Sebring Site — DVP Insight Platform (API key rotated ' + new Date().toISOString().slice(0,10) + ')',
  'PUBLIC_FIREBASE_API_KEY=' + newKey,
  'PUBLIC_FIREBASE_AUTH_DOMAIN=' + sdk.authDomain,
  'PUBLIC_FIREBASE_PROJECT_ID=' + sdk.projectId,
  'PUBLIC_FIREBASE_STORAGE_BUCKET=' + sdk.storageBucket,
  'PUBLIC_FIREBASE_MESSAGING_SENDER_ID=' + sdk.messagingSenderId,
  'PUBLIC_FIREBASE_APP_ID=' + sdk.appId,
  '',
];
require('fs').writeFileSync(process.argv[3], lines.join('\n'));
console.log('Wrote ' + process.argv[3]);
" "$SDK_JSON" "$NEW_KEY" "$ENV_FILE"

echo ""
echo "Searching for old Sebring API key to delete..."
KEYS_JSON="$(gcloud services api-keys list --project="$PROJECT_ID" --format=json)"
OLD_RESOURCE="$(node -e "
const keys = JSON.parse(process.argv[1]);
const { execSync } = require('child_process');
const prefix = process.argv[2];
const project = process.argv[3];
for (const k of keys) {
  if (k.name === process.argv[4]) continue;
  const s = execSync(
    'gcloud services api-keys get-key-string ' + k.name + ' --project=' + project + \" --format='value(keyString)'\", 
    { encoding: 'utf8' }
  ).trim();
  if (s.startsWith(prefix)) {
    console.log(k.name);
    process.exit(0);
  }
}
" "$KEYS_JSON" "$OLD_KEY_PREFIX" "$PROJECT_ID" "$NEW_KEY_RESOURCE")"

if [[ -n "$OLD_RESOURCE" ]]; then
  echo "Deleting old key: $OLD_RESOURCE"
  gcloud services api-keys delete "$OLD_RESOURCE" --project="$PROJECT_ID" --quiet
else
  echo "Old key not found (may already be deleted)."
fi

echo ""
echo "=== Next steps ==="
echo "  1. npm run deploy          # rebuild dist with new key + rsync"
echo "  2. Test https://sebring.marcsherwood.com/admin sign-in"
echo ""
echo "If you set GEMINI_API_KEY for AI identify, rotate it separately:"
echo "  https://aistudio.google.com/apikey  → revoke old key"
echo "  cd apps/sebring/functions && firebase functions:secrets:set GEMINI_API_KEY"
echo ""
echo "Optional: delete duplicate keys created during rotation in GCP Console:"
echo "  https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo ""
echo "Done."
