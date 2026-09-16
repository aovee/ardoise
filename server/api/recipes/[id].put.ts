import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

// PUT /api/recipes/:id — replace a recipe's fields. 404 if it doesn't exist.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const input = await readRecipeInput(event)

  // Read the current image so we can clean it up if this update replaces it.
  const existing = await db
    .select({ image: schema.recipes.image })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
  }

  await db
    .update(schema.recipes)
    .set({
      title: input.title,
      prepTime: input.timers.preparation,
      cookTime: input.timers.cooking,
      categories: input.categories,
      ingredients: input.ingredients,
      image: input.image ?? null,
      servings: input.servings,
      updatedAt: sql`(datetime('now'))`
    })
    .where(eq(schema.recipes.id, id))

  // If the image changed, delete the old blob (no-op for pasted/external URLs).
  const oldImage = existing[0]?.image ?? null
  if (oldImage !== (input.image ?? null)) {
    await deleteBlobIfOwned(oldImage)
  }

  return { id, ...input }
})
