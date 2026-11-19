#!/usr/bin/env bash
# Remove apex + www from homelab Caddy after marcsherwood.com is on Cloudflare Pages.
set -euo pipefail

HOST="${HOMELAB_HOST:-root@192.168.0.62}"
CADDYFILE="/etc/caddy/Caddyfile"

ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
python3 <<'PY'
from pathlib import Path

path = Path("/etc/caddy/Caddyfile")
text = path.read_text()
blocks = ["www.marcsherwood.com", "marcsherwood.com"]
lines = text.splitlines()
out = []
skip = False
depth = 0
for line in lines:
    stripped = line.strip()
    if not skip:
        for host in blocks:
            if stripped == f"{host} {{":
                skip = True
                depth = 1
                break
    if skip:
        depth += line.count("{") - line.count("}")
        if depth <= 0:
            skip = False
        continue
    out.append(line)
new_text = "\n".join(out).strip() + "\n"
if "marcsherwood.com {" in new_text or "www.marcsherwood.com {" in new_text:
    raise SystemExit("Failed to remove marcsherwood blocks from Caddyfile")
path.write_text(new_text)
print("Updated Caddyfile (kept sebring.marcsherwood.com)")
PY
systemctl reload caddy || caddy reload --config "$CADDYFILE"
REMOTE

echo "Homelab Caddy reloaded."