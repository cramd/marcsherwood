#!/usr/bin/env bash
# Remove apex + www from homelab Caddy after marcsherwood.com is on Cloudflare Pages.
set -euo pipefail

HOST="${HOMELAB_HOST:-root@192.168.0.62}"
CADDYFILE="/etc/caddy/Caddyfile"

ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
python3 <<'PY'
import re
from pathlib import Path

path = Path("/etc/caddy/Caddyfile")
text = path.read_text()
blocks = ("www.marcsherwood.com", "marcsherwood.com")
lines = text.splitlines()
out = []
skip = False
depth = 0
site_line = re.compile(r"^[a-z0-9.*-]+(?:\.[a-z0-9.-]+)*(?:,\s*[a-z0-9.*-]+(?:\.[a-z0-9.-]+)*)*\s+\{", re.I)

for line in lines:
    stripped = line.strip()
    if not skip:
        if stripped.endswith("{") and any(stripped == f"{host} {{" for host in blocks):
            skip = True
            depth = 0
            continue
    if skip:
        # Ignore template placeholders like `{uri}` on redir lines.
        open_count = line.count("{")
        close_count = line.count("}")
        if "{uri}" in line:
            open_count -= line.count("{uri}")
            close_count -= line.count("{uri}")
        depth += open_count - close_count
        if depth <= 0:
            skip = False
        continue
    out.append(line)

new_text = "\n".join(out).strip() + "\n"
if "marcsherwood.com {" in new_text or "www.marcsherwood.com {" in new_text:
    raise SystemExit("Failed to remove marcsherwood blocks from Caddyfile")
if "sebring.marcsherwood.com {" not in new_text:
    raise SystemExit("Missing sebring.marcsherwood.com block — aborting")
path.write_text(new_text)
print("Updated Caddyfile (kept sebring.marcsherwood.com)")
PY
caddy validate --config "$CADDYFILE"
systemctl reload caddy || caddy reload --config "$CADDYFILE"
REMOTE

echo "Homelab Caddy reloaded."