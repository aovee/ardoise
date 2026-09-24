import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

// POST /api/meal-plans — plan a recipe for one of a day's 2 meals (lunch or
// dinner), for a given number of people. Body is validated by the schema.
export default defineEventHandler(async (event) => {
  const input = await readMealPlanInput(event)

  const recipe = await db
    .select({ id: schema.recipes.id })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, input.recipeId))
    .limit(1)

  if (recipe.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
  }

  const id = crypto.randomUUID()

  await db.insert(schema.mealPlans).values({
    id,
    userId: DEFAULT_USER_ID,
    date: input.date,
    mealType: input.mealType,
    recipeId: input.recipeId,
    servings: input.servings
  })

  setResponseStatus(event, 201) // 201 Created
  return { id, ...input }
})
