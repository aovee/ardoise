import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

// GET /api/recipes/:id — fetch one recipe, or 404.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  const rows = await db
    .select()
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .limit(1)

  const row = rows[0]
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
  }

  return rowToRecipe(row)
})
