import type { Row } from '@libsql/client'
import { recipeInputSchema, type Recipe, type RecipeInput } from '../../shared/utils/recipe'

// The schema + types now live in shared/utils/recipe.ts (auto-imported app-side too).
// This file keeps only the pieces that are server-only.

// ── DB row → clean API object ────────────────────────────────────────
export function rowToRecipe(row: Row): Recipe {
  return {
    id: String(row.id),
    title: String(row.title),
    timers: {
      preparation: Number(row.prep_time),
      cooking: Number(row.cook_time)
    },
    categories: row.categories ? JSON.parse(String(row.categories)) : [],
    ingredients: row.ingredients ? JSON.parse(String(row.ingredients)) : [],
    image: row.image ? String(row.image) : undefined
  }
}

// ── Read + validate a request body ───────────────────────────────────
export async function readRecipeInput(event: Parameters<typeof readBody>[0]): Promise<RecipeInput> {
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
