import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const createIngredientSchema = () =>
  z.object({
    name: z.string(),
    quantity: z.object({
      amount: z.union([z.number(), z.string()]),
      unit: z.string()
    })
  })

export default defineContentConfig({
  collections: {
    recipes: defineCollection({
      type: 'data',
      source: 'recipes/*.json',
      schema: z.object({
        id: z.string(),
        title: z.string(),
        timers: z.object({
          preparation: z.number(),
          cooking: z.number()
        }),
        categories: z.array(z.string()).optional(),
        ingredients: z.array(createIngredientSchema()).optional(),
        image: z.string().optional()
      })
    })
  }
})
