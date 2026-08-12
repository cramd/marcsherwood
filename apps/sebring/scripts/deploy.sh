#!/usr/bin/env bash
set -euo pipefail

HOST="${SEBRING_DEPLOY_HOST:-192.168.0.62}"
USER="${SEBRING_DEPLOY_USER:-root}"
REMOTE_PATH="${SEBRING_DEPLOY_PATH:-/var/www/sebring.marcsherwood.com/}"
SSH_OPTS=(-o ConnectTimeout=10 -o BatchMode=yes)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d dist ]]; then
  echo "No dist/ folder — run npm run build first."
  exit 1
fi

echo "Checking SSH to Caddy server (${USER}@${HOST})..."
if ! ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" "echo ok" >/dev/null 2>&1; then
  cat <<EOF
Deploy failed: cannot reach Caddy server at ${USER}@${HOST}.

The build succeeded — dist/ is ready. Connect to home LAN or VPN, then:

  npm run deploy:rsync

Sites deploy by SSH/rsync to Caddy, not Firebase Hosting.
EOF
  exit 1
fi

echo "Syncing dist/ → ${USER}@${HOST}:${REMOTE_PATH}"
rsync -avz --delete dist/ "${USER}@${HOST}:${REMOTE_PATH}"
echo "Deploy complete."
