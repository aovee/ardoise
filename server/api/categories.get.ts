import { db, schema } from '@nuxthub/db'

// GET /api/categories — the distinct set of categories across all recipes, sorted.
// Categories live in a JSON column, so we flatten + dedupe in JS rather than
// leaning on a dialect-specific json_each().
export default defineEventHandler(async () => {
  const rows = await db
    .select({ categories: schema.recipes.categories })
    .from(schema.recipes)

  const categories = new Set<string>()
  for (const row of rows) {
    for (const category of row.categories ?? []) {
      categories.add(category)
    }
  }

  return [...categories].sort()
})
