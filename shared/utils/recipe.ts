import { z } from 'zod'

// Recipe validation schema + types. Lives in shared/ so it is auto-imported in
// BOTH the Vue app (the form) and the Nitro server (the API) — one source of truth.
export const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.object({
    amount: z.string(),
    unit: z.string().optional()
  })
})

export const recipeInputSchema = z.object({
  title: z.string().min(1),
  timers: z.object({
    preparation: z.number().nonnegative(),
    cooking: z.number().nonnegative()
  }),
  servings: z.number().nonnegative(),
  categories: z.array(z.string()).default([]),
  ingredients: z.array(ingredientSchema).default([]),
  image: z.string().optional()
})

export type RecipeInput = z.infer<typeof recipeInputSchema>
export interface Recipe extends RecipeInput {
  id: string
  createdAt: string
}
