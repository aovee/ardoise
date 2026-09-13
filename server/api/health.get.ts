// GET /api/health — verifies the Turso connection is live.
export default defineEventHandler(async () => {
  const db = useDb()
  const result = await db.execute('SELECT 1 AS ok')
  return { ok: result.rows[0]?.ok === 1 }
})
