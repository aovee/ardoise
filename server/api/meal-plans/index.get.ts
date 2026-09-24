import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

// GET /api/meal-plans?date=YYYY-MM-DD
// GET /api/meal-plans?from=YYYY-MM-DD&to=YYYY-MM-DD
// Lists the meal plans for a single day, or a date range (e.g. a week).
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const date = typeof query.date === 'string' ? query.date : undefined
  const from = typeof query.from === 'string' ? query.from : (date ?? undefined)
  const to = typeof query.to === 'string' ? query.to : (date ?? undefined)

  const conditions = [eq(schema.mealPlans.userId, DEFAULT_USER_ID)]
  if (from) conditions.push(gte(schema.mealPlans.date, from))
  if (to) conditions.push(lte(schema.mealPlans.date, to))

  const rows = await db
    .select()
    .from(schema.mealPlans)
    .innerJoin(schema.recipes, eq(schema.mealPlans.recipeId, schema.recipes.id))
    .where(and(...conditions))
    .orderBy(asc(schema.mealPlans.date))

  return rows.map((row) => rowToMealPlan(row.meal_plans, row.recipes))
})
