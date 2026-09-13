// GET /api/recipes — list all recipes, alphabetically.
export default defineEventHandler(async () => {
  const db = useDb()
  const { rows } = await db.execute('SELECT * FROM recipes ORDER BY title')
  return rows.map(rowToRecipe)
})
