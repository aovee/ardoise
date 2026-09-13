// PUT /api/recipes/:id — replace a recipe's fields. 404 if it doesn't exist.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const input = await readRecipeInput(event)

  const db = useDb()

  // Read the current image so we can clean it up if this update replaces it.
  const { rows } = await db.execute({
    sql: 'SELECT image FROM recipes WHERE id = ?',
    args: [id]
  })

  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
  }

  await db.execute({
    sql: `UPDATE recipes
          SET title = ?, prep_time = ?, cook_time = ?, categories = ?, ingredients = ?, image = ?,
              updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      input.title,
      input.timers.preparation,
      input.timers.cooking,
      JSON.stringify(input.categories),
      JSON.stringify(input.ingredients),
      input.image ?? null,
      id
    ]
  })

  // If the image changed, delete the old blob (no-op for pasted/external URLs).
  const oldImage = rows[0].image ? String(rows[0].image) : null
  if (oldImage !== (input.image ?? null)) {
    await deleteBlobIfOwned(oldImage)
  }

  return { id, ...input }
})
