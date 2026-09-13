// DELETE /api/recipes/:id — remove a recipe. 404 if it wasn't there.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  const db = useDb()

  // Grab the image first so we can clean up its blob after the row is gone.
  const { rows } = await db.execute({
    sql: 'SELECT image FROM recipes WHERE id = ?',
    args: [id]
  })

  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
  }

  await db.execute({ sql: 'DELETE FROM recipes WHERE id = ?', args: [id] })
  await deleteBlobIfOwned(rows[0].image ? String(rows[0].image) : null)

  return { ok: true }
})
