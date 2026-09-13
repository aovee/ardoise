export default defineEventHandler(async () => {
  const db = useDb()

  const { rows } = await db.execute({
    sql: `SELECT DISTINCT j.value AS category 
    FROM recipes, json_each(recipes.categories) AS j 
    WHERE recipes.categories IS NOT NULL 
    ORDER BY category;`
  })

  return rows.map((row) => String(row.category))
})
