import { z } from 'zod'
import type { Recipe } from './recipe'

// A day only has 2 meal slots to plan for.
export const mealTypes = ['lunch', 'dinner'] as const
export type MealType = (typeof mealTypes)[number]

export const mealTypeLabels: Record<MealType, string> = {
  lunch: 'Déjeuner',
  dinner: 'Dîner'
}

// Meal plan validation schema + types. Lives in shared/ so it is auto-imported
// in BOTH the Vue app (the modal) and the Nitro server (the API).
export const mealPlanInputSchema = z.object({
  date: z.string().min(1), // ISO date, e.g. 2026-09-10
  mealType: z.enum(mealTypes),
  recipeId: z.string().min(1),
  // The number of people to serve for this meal — independent from the
  // recipe's own default `servings`, since it can change from one meal to
  // the next even for the same recipe.
  servings: z.number().int().positive()
})

export type MealPlanInput = z.infer<typeof mealPlanInputSchema>
export interface MealPlan extends MealPlanInput {
  id: string
  createdAt: string
}
export interface MealPlanWithRecipe extends MealPlan {
  recipe: Recipe
}
