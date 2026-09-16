import { sql } from 'drizzle-orm'
import { db } from '@nuxthub/db'

// GET /api/health — verifies the database connection is live.
export default defineEventHandler(async () => {
  await db.run(sql`SELECT 1`)
  return { ok: true }
})
