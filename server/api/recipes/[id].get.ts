// GET /api/recipes/:id — fetch one recipe, or 404.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const db = useDb()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM recipes WHERE id = ?',
    args: [id ?? '']
  })

  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
  }

  return rowToRecipe(rows[0]!)
})
