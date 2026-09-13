// Applies schema.sql to the Turso database. Idempotent (CREATE ... IF NOT EXISTS),
// so it's safe to run on every dev start and every build/generate.
//
// Run standalone with:  node server/database/migrate.ts
//
// Env vars (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN) are read from a local .env if
// present (dev), and otherwise from the process environment (Vercel build).
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@libsql/client'

// Load .env when it exists (local dev). On Vercel the file is absent and the
// vars are already in process.env, so this is skipped.
if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

const url = process.env.TURSO_DATABASE_URL
if (!url) {
  console.error('✗ TURSO_DATABASE_URL is not set — skipping migration.')
  process.exit(1)
}

const here = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(here, 'schema.sql'), 'utf8')

// Strip line comments, then split on ';' into individual statements
// (schema.sql has no ';' inside values).
const statements = sql
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })

for (const stmt of statements) {
  await db.execute(stmt)
  console.log('✓', stmt.split('\n')[0])
}

console.log(`\nSchema up to date (${statements.length} statements).`)
