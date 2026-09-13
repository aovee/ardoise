// POST /api/recipes — create a recipe. Body is validated by the schema.
export default defineEventHandler(async (event) => {
  const input = await readRecipeInput(event)
  const id = crypto.randomUUID()

  const db = useDb()
  await db.execute({
    sql: `INSERT INTO recipes (id, title, prep_time, cook_time, categories, ingredients, image, servings)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.title,
      input.timers.preparation,
      input.timers.cooking,
      JSON.stringify(input.categories),
      JSON.stringify(input.ingredients),
      input.image ?? null,
      input.servings
    ]
  })

  setResponseStatus(event, 201) // 201 Created
  return { id, ...input }
})
