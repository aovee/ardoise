import type { MealPlanWithRecipe, MealType } from './mealPlan'

export interface GroceryItem {
  key: string // normalized name + unit, used for merging and checkboxes
  name: string
  unit?: string // canonical unit (g, ml, …) when the amount was converted
  amount: number | null // null when no amount could be parsed
  rawAmounts: string[] // e.g. "une pincée", "selon goût"
  sources: { recipeTitle: string; date: string; mealType: MealType }[]
}

// ── Units ────────────────────────────────────────────────────────────
// Aliases → canonical unit + factor, so "0,3 kg" and "200 gr" of the same
// ingredient merge into a single line in grams.
// Keys are compacted (see `compact`), so "c. à s.", "c.à.s" and "cas" all match.
const unitAliases: Record<string, { unit: string; factor: number }> = {
  g: { unit: 'g', factor: 1 },
  gr: { unit: 'g', factor: 1 },
  gramme: { unit: 'g', factor: 1 },
  grammes: { unit: 'g', factor: 1 },
  kg: { unit: 'g', factor: 1000 },
  kilo: { unit: 'g', factor: 1000 },
  kilos: { unit: 'g', factor: 1000 },
  ml: { unit: 'ml', factor: 1 },
  cl: { unit: 'ml', factor: 10 },
  dl: { unit: 'ml', factor: 100 },
  l: { unit: 'ml', factor: 1000 },
  litre: { unit: 'ml', factor: 1000 },
  litres: { unit: 'ml', factor: 1000 },
  cs: { unit: 'c. à s.', factor: 1 },
  cas: { unit: 'c. à s.', factor: 1 },
  cuillereasoupe: { unit: 'c. à s.', factor: 1 },
  cuilleresasoupe: { unit: 'c. à s.', factor: 1 },
  cc: { unit: 'c. à c.', factor: 1 },
  cac: { unit: 'c. à c.', factor: 1 },
  cuillereacafe: { unit: 'c. à c.', factor: 1 },
  cuilleresacafe: { unit: 'c. à c.', factor: 1 }
}

// Lowercase, trim, collapse spaces, strip accents and ligatures:
// "Crème  Fraîche" → "creme fraiche", "Œufs" → "oeufs".
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeUnit(unit: string | undefined): { unit?: string; factor: number } {
  if (!unit?.trim()) return { factor: 1 }
  return unitAliases[compact(unit)] ?? { unit: unit.trim(), factor: 1 }
}

// normalize() without spaces or punctuation: "C. à s." → "cas".
function compact(value: string): string {
  return normalize(value).replace(/[^a-z0-9]/g, '')
}

// ── Amounts ──────────────────────────────────────────────────────────
const unicodeFractions: Record<string, string> = {
  '½': ' 1/2',
  '⅓': ' 1/3',
  '⅔': ' 2/3',
  '¼': ' 1/4',
  '¾': ' 3/4'
}

function parseNumber(value: string): number | null {
  const fraction = value.match(/^(\d+)\/(\d+)$/)
  if (fraction) {
    const denominator = Number(fraction[2])
    return denominator ? Number(fraction[1]) / denominator : null
  }
  return /^\d+(\.\d+)?$/.test(value) ? Number(value) : null
}

// Parses "200", "1,5", "1/2", "½", "1 ½", "2-3" (upper bound, to buy enough).
// Returns null for anything else ("une pincée", "selon goût").
export function parseAmount(raw: string): number | null {
  let value = raw.trim().replace(/,/g, '.')
  for (const [char, replacement] of Object.entries(unicodeFractions)) {
    value = value.replaceAll(char, replacement)
  }
  value = value.replace(/\s+/g, ' ').trim()
  if (!value) return null

  const range = value.split(/\s*[-–à]\s*/)
  if (range.length === 2) return parseAmount(range[1]!)

  const parts = value.split(' ').map(parseNumber)
  if (parts.some((part) => part === null)) return null
  return (parts as number[]).reduce((sum, part) => sum + part, 0)
}

// ── Building the list ────────────────────────────────────────────────
export function buildGroceryList(mealPlans: MealPlanWithRecipe[]): GroceryItem[] {
  const items = new Map<string, GroceryItem>()

  for (const plan of mealPlans) {
    const { recipe } = plan
    // Scale the recipe to the number of people planned for this meal.
    const scale = recipe.servings > 0 ? plan.servings / recipe.servings : 1

    for (const ingredient of recipe.ingredients ?? []) {
      const { unit, factor } = normalizeUnit(ingredient.quantity.unit)
      const key = `${normalize(ingredient.name)}|${unit ? compact(unit) : ''}`

      let item = items.get(key)
      if (!item) {
        item = {
          key,
          name: ingredient.name.trim(),
          unit,
          amount: null,
          rawAmounts: [],
          sources: []
        }
        items.set(key, item)
      }

      const amount = parseAmount(ingredient.quantity.amount)
      if (amount !== null) {
        item.amount = (item.amount ?? 0) + amount * factor * scale
      } else if (ingredient.quantity.amount.trim()) {
        const raw = [ingredient.quantity.amount, ingredient.quantity.unit]
          .filter(Boolean)
          .join(' ')
          .trim()
        if (!item.rawAmounts.includes(raw)) item.rawAmounts.push(raw)
      }

      item.sources.push({
        recipeTitle: recipe.title,
        date: plan.date,
        mealType: plan.mealType
      })
    }
  }

  return [...items.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  )
}

// ── Display ──────────────────────────────────────────────────────────
function formatNumber(value: number, maxDecimals: number): string {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals })
}

// "1500 g" → "1,5 kg", "2.9999" eggs → "3", "750 ml" → "75 cl".
export function formatGroceryAmount(item: GroceryItem): string {
  const parts: string[] = []

  if (item.amount !== null) {
    const { amount, unit } = item
    if (unit === 'g' && amount >= 1000) {
      parts.push(`${formatNumber(amount / 1000, 2)} kg`)
    } else if (unit === 'ml' && amount >= 1000) {
      parts.push(`${formatNumber(amount / 1000, 2)} l`)
    } else if (unit === 'ml' && amount >= 10) {
      parts.push(`${formatNumber(amount / 10, 1)} cl`)
    } else if (unit === 'g' || unit === 'ml') {
      parts.push(`${formatNumber(Math.round(amount), 0)} ${unit}`)
    } else if (!unit) {
      // Countable items (eggs, lemons…): you can't buy 2.67 of them.
      parts.push(formatNumber(Math.ceil(amount - 1e-9), 0))
    } else {
      parts.push(`${formatNumber(amount, 2)} ${unit}`)
    }
  }

  return [...parts, ...item.rawAmounts].join(' + ')
}
