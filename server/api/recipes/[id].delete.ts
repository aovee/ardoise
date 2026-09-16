import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

// DELETE /api/recipes/:id — remove a recipe. 404 if it wasn't there.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  // Grab the image first so we can clean up its blob after the row is gone.
  const existing = await db
    .select({ image: schema.recipes.image })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
  }

  await db.delete(schema.recipes).where(eq(schema.recipes.id, id))
  await deleteBlobIfOwned(existing[0]?.image ?? null)

  return { ok: true }
})
