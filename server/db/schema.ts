import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { Ingredient } from '../../shared/utils/recipe'

export const recipes = sqliteTable('recipes', {
  id: text().primaryKey(),
  title: text().notNull(),
  prepTime: integer('prep_time').notNull().default(0),
  cookTime: integer('cook_time').notNull().default(0),
  categories: text({ mode: 'json' }).$type<string[]>(),
  ingredients: text({ mode: 'json' }).$type<Ingredient[]>(),
  servings: integer().notNull().default(1),
  image: text(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`)
})

export const mealPlans = sqliteTable(
  'meal_plans',
  {
    id: text().primaryKey(),
    userId: text('user_id').notNull(),
    date: text().notNull(), // ISO date, e.g. 2026-09-10
    mealType: text('meal_type').notNull(), // breakfast | lunch | dinner | …
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    servings: integer().notNull().default(1),
    notes: text(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`)
  },
  (table) => [index('idx_meal_plans_user_date').on(table.userId, table.date)]
)

export type RecipeRow = typeof recipes.$inferSelect
export type MealPlanRow = typeof mealPlans.$inferSelect
