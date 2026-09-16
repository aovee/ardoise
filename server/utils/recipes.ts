import type { RecipeRow } from '../db/schema'
import {
  recipeInputSchema,
  type Recipe,
  type RecipeInput
} from '../../shared/utils/recipe'

// The schema + types now live in shared/utils/recipe.ts (auto-imported app-side too).
// This file keeps only the pieces that are server-only.

// ── DB row → clean API object ────────────────────────────────────────
// The row comes from Drizzle: keys are camelCase and JSON columns are already
// parsed, so there's nothing to JSON.parse here.
export function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    timers: {
      preparation: row.prepTime,
      cooking: row.cookTime
    },
    servings: row.servings,
    categories: row.categories ?? [],
    ingredients: row.ingredients ?? [],
    image: row.image ?? undefined,
    createdAt: row.createdAt
  }
}

// ── Read + validate a request body ───────────────────────────────────
export async function readRecipeInput(
  event: Parameters<typeof readBody>[0]
): Promise<RecipeInput> {
  const result = recipeInputSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid recipe',
      data: result.error.flatten()
    })
  }
  return result.data
}
