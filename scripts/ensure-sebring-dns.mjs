#!/usr/bin/env node
import fs from "node:fs";
/**
 * Keep sebring.marcsherwood.com on the homelab (orange-cloud A → homelab public IP).
 *
 * Usage:
 *   CF_API_TOKEN=... node scripts/ensure-sebring-dns.mjs
 *   CF_API_TOKEN=... node scripts/ensure-sebring-dns.mjs --dry-run
 */
const ZONE_ID = "dffd0c3cdd5c485f042fb0bb5957f042";
const HOSTNAME = "sebring.marcsherwood.com";
const DEFAULT_ORIGIN_IP = "207.6.231.172";

const dryRun = process.argv.includes("--dry-run");

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function readToken() {
  if (process.env.CF_API_TOKEN) return process.env.CF_API_TOKEN;
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  const tokenPath =
    process.env.CF_API_TOKEN_FILE ??
    `${process.env.HOME}/.config/marcsherwood/cf-token`;
  try {
    const raw = fs.readFileSync(tokenPath, "utf8").trim();
    if (raw) return raw;
  } catch {
    /* optional */
  }
  return null;
}

async function cf(pathSuffix, options = {}) {
  const token = readToken();
  if (!token) {
    fail(
      "Set CF_API_TOKEN (Zone DNS Edit for marcsherwood.com) or ~/.config/marcsherwood/cf-token.",
    );
  }
  const url = `https://api.cloudflare.com/client/v4${pathSuffix}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    fail(`${pathSuffix}: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.result;
}

async function listRecords(name) {
  const q = new URLSearchParams({ name, per_page: "100" });
  return cf(`/zones/${ZONE_ID}/dns_records?${q}`);
}

async function deleteRecord(record) {
  if (dryRun) {
    console.log(`(dry-run) DELETE ${record.type} ${record.name} → ${record.content}`);
    return;
  }
  await cf(`/zones/${ZONE_ID}/dns_records/${record.id}`, { method: "DELETE" });
  console.log(`Deleted ${record.type} ${record.name}`);
}

async function main() {
  const originIp = process.env.SEBRING_ORIGIN_IP ?? DEFAULT_ORIGIN_IP;
  const records = await listRecords(HOSTNAME);
  const bad = records.filter(
    (r) =>
      r.type === "CNAME" ||
      (r.type === "A" && r.content !== originIp) ||
      r.proxied === false,
  );
  for (const record of bad) {
    await deleteRecord(record);
  }
  const existingA = records.find((r) => r.type === "A" && r.content === originIp);
  const payload = {
    type: "A",
    name: "sebring",
    content: originIp,
    proxied: true,
    ttl: 1,
  };
  if (existingA && existingA.proxied) {
    console.log(`OK: ${HOSTNAME} → ${originIp} (proxied)`);
    return;
  }
  if (dryRun) {
    console.log(`(dry-run) UPSERT A ${HOSTNAME} → ${originIp} proxied`);
    return;
  }
  if (existingA) {
    await cf(`/zones/${ZONE_ID}/dns_records/${existingA.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } else {
    await cf(`/zones/${ZONE_ID}/dns_records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  console.log(`Updated ${HOSTNAME} → ${originIp} (proxied)`);
}

main().catch((err) => fail(err.message));