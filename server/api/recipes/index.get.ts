import { asc } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

// GET /api/recipes — list all recipes, alphabetically.
export default defineEventHandler(async () => {
  const rows = await db
    .select()
    .from(schema.recipes)
    .orderBy(asc(schema.recipes.title))

  return rows.map(rowToRecipe)
})
