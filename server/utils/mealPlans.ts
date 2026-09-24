import type { MealPlanRow, RecipeRow } from '../db/schema'
import {
  mealPlanInputSchema,
  type MealPlanInput,
  type MealPlanWithRecipe,
  type MealType
} from '../../shared/utils/mealPlan'
import { rowToRecipe } from './recipes'

// No auth system yet — the app is single-user for now, so every meal plan
// belongs to this fixed user id.
export const DEFAULT_USER_ID = 'default'

// ── DB rows → clean API object ───────────────────────────────────────
export function rowToMealPlan(
  row: MealPlanRow,
  recipeRow: RecipeRow
): MealPlanWithRecipe {
  return {
    id: row.id,
    date: row.date,
    mealType: row.mealType as MealType,
    recipeId: row.recipeId,
    servings: row.servings,
    createdAt: row.createdAt,
    recipe: rowToRecipe(recipeRow)
  }
}

// ── Read + validate a request body ───────────────────────────────────
export async function readMealPlanInput(
  event: Parameters<typeof readBody>[0]
): Promise<MealPlanInput> {
  const result = mealPlanInputSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid meal plan',
      data: result.error.flatten()
    })
  }
  return result.data
}
