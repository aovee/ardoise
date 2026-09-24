import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

// DELETE /api/meal-plans/:id — remove a planned meal. 404 if it wasn't there.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  const existing = await db
    .select({ id: schema.mealPlans.id })
    .from(schema.mealPlans)
    .where(eq(schema.mealPlans.id, id))
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Meal plan not found' })
  }

  await db.delete(schema.mealPlans).where(eq(schema.mealPlans.id, id))

  return { ok: true }
})
