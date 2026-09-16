import { db, schema } from '@nuxthub/db'

// POST /api/recipes — create a recipe. Body is validated by the schema.
export default defineEventHandler(async (event) => {
  const input = await readRecipeInput(event)
  const id = crypto.randomUUID()

  await db.insert(schema.recipes).values({
    id,
    title: input.title,
    prepTime: input.timers.preparation,
    cookTime: input.timers.cooking,
    categories: input.categories,
    ingredients: input.ingredients,
    image: input.image ?? null,
    servings: input.servings
  })

  setResponseStatus(event, 201) // 201 Created
  return { id, ...input }
})
