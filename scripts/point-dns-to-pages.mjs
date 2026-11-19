#!/usr/bin/env node
import fs from "node:fs";
/**
 * Point marcsherwood.com + www at Cloudflare Pages (keeps sebring.marcsherwood.com untouched).
 *
 * Usage:
 *   CF_API_TOKEN=... node scripts/point-dns-to-pages.mjs
 *   CF_API_TOKEN=... node scripts/point-dns-to-pages.mjs --dry-run
 */
const ZONE_ID = "dffd0c3cdd5c485f042fb0bb5957f042";
const PAGES_CNAME = "marcsherwood.pages.dev";
const APEX = "marcsherwood.com";
const WWW = "www";

const dryRun = process.argv.includes("--dry-run");

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function readToken() {
  if (process.env.CF_API_TOKEN) {
    return process.env.CF_API_TOKEN;
  }
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }
  const tokenPath =
    process.env.CF_API_TOKEN_FILE ??
    `${process.env.HOME}/.config/marcsherwood/cf-token`;
  try {
    const raw = fs.readFileSync(tokenPath, "utf8").trim();
    if (raw) {
      return raw;
    }
  } catch {
    /* optional file */
  }
  return null;
}

async function cf(pathSuffix, options = {}) {
  const token = readToken();
  if (!token) {
    fail(
      "Set CF_API_TOKEN, CLOUDFLARE_API_TOKEN, or ~/.config/marcsherwood/cf-token (Zone → DNS → Edit for marcsherwood.com).",
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

async function upsertCname(name, target) {
  const fqdn = name === APEX ? APEX : `${name}.${APEX}`;
  const existing = await listRecords(fqdn);
  const cname = existing.find((r) => r.type === "CNAME" && r.name === fqdn);
  const payload = {
    type: "CNAME",
    name,
    content: target,
    proxied: true,
    ttl: 1,
  };
  if (cname) {
    if (dryRun) {
      console.log(`(dry-run) UPDATE CNAME ${fqdn} → ${target}`);
      return;
    }
    await cf(`/zones/${ZONE_ID}/dns_records/${cname.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    console.log(`Updated CNAME ${fqdn} → ${target}`);
    return;
  }
  const aaaa = existing.filter((r) => r.type === "A" || r.type === "AAAA");
  for (const record of aaaa) {
    await deleteRecord(record);
  }
  if (dryRun) {
    console.log(`(dry-run) CREATE CNAME ${fqdn} → ${target}`);
    return;
  }
  await cf(`/zones/${ZONE_ID}/dns_records`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log(`Created CNAME ${fqdn} → ${target}`);
}

async function main() {
  const sebring = await listRecords(`sebring.${APEX}`);
  console.log(
    "sebring stays as-is:",
    sebring.map((r) => `${r.type} ${r.content} proxied=${r.proxied}`).join("; ") || "(no records)"
  );
  await upsertCname(APEX, PAGES_CNAME);
  await upsertCname(WWW, PAGES_CNAME);
  console.log("Done. Pages custom domains should turn Active within a few minutes.");
}

main().catch((err) => fail(err.message));