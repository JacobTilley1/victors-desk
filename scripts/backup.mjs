/**
 * Content backup.
 *
 * Writes every table to a timestamped JSON file. Your code is on GitHub; this
 * is for the part that isn't — articles, comments, forum threads, subscribers.
 *
 *   node scripts/backup.mjs
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local. That key bypasses row-level
 * security, which is why it's required here and why it must never be committed
 * or put in Vercel as a NEXT_PUBLIC_ variable.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Minimal .env.local reader so this runs without extra dependencies.
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('Find the service role key in Supabase > Project Settings > API.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const TABLES = [
  'profiles',
  'posts',
  'comments',
  'post_likes',
  'forum_categories',
  'forum_threads',
  'forum_replies',
  'reports',
  'subscribers',
];

const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const dir = join('backups');
mkdirSync(dir, { recursive: true });

const dump = { exportedAt: new Date().toISOString(), tables: {} };
let total = 0;

for (const table of TABLES) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`  ! ${table}: ${error.message}`);
    continue;
  }
  dump.tables[table] = data ?? [];
  total += data?.length ?? 0;
  console.log(`  ${String(data?.length ?? 0).padStart(5)}  ${table}`);
}

const file = join(dir, `victorsdesk-${stamp}.json`);
writeFileSync(file, JSON.stringify(dump, null, 2));

console.log(`\nSaved ${total} rows to ${file}`);
console.log('Keep a copy somewhere other than this computer.');
