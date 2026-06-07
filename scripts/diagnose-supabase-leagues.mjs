#!/usr/bin/env node
/**
 * Diagnostyka tabeli leagues w Supabase.
 * Uruchom: node scripts/diagnose-supabase-leagues.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) {
  console.error("Brak NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w .env.local");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function probeColumn(column) {
  const response = await fetch(`${url}/rest/v1/leagues?select=${column}&limit=0`, {
    headers,
  });
  return { column, ok: response.ok, status: response.status, body: await response.text() };
}

console.log("=== Diagnostyka Supabase: ligi ===\n");

const columns = [
  "id",
  "name",
  "invite_code",
  "code",
  "created_by",
  "owner_id",
  "created_at",
];

for (const column of columns) {
  const result = await probeColumn(column);
  console.log(
    `${result.ok ? "OK" : "FAIL"}  ${column.padEnd(14)} ${result.ok ? "istnieje" : result.body}`,
  );
}

const rpc = await fetch(`${url}/rest/v1/rpc/find_league_id_by_invite_code`, {
  method: "POST",
  headers,
  body: JSON.stringify({ p_code: "TEST12" }),
});
console.log(
  `\nRPC find_league_id_by_invite_code: ${rpc.status} ${await rpc.text()}`,
);

const insert = await fetch(`${url}/rest/v1/leagues`, {
  method: "POST",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({
    id: "55555555-5555-5555-5555-555555555555",
    name: "Diag",
    invite_code: "DIAG05",
    code: "DIAG05",
    created_by: "55555555-5555-5555-5555-555555555555",
    owner_id: "55555555-5555-5555-5555-555555555555",
  }),
});
console.log(`\nINSERT (anon, bez logowania): ${insert.status}`);
console.log(await insert.text());
console.log(
  "\nJeśli INSERT zwraca 42501 (RLS) — uruchom supabase/fix-leagues-rls.sql w SQL Editor.",
);
