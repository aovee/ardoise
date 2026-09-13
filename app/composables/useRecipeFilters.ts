import type { MaybeRefOrGetter } from 'vue'

export interface SortItem {
  label: string
  value: string
}

export const recipeSortItems: SortItem[] = [
  {
    label: 'Du plus récent au plus ancien',
    value: 'created_at.desc'
  },
  {
    label: 'Du plus ancien au plus récent',
    value: 'created_at.asc'
  },
  {
    label: 'De A à Z',
    value: 'title.asc'
  },
  {
    label: 'De Z à A',
    value: 'title.desc'
  }
]

// Owns the search / category / sort state and the derived pipeline for the
// recipes list. Kept client-side: the dataset is small, so filtering here is
// instant and avoids extra API round-trips.
export function useRecipeFilters(
  source: MaybeRefOrGetter<Recipe[] | null | undefined>
) {
  const recipes = computed<Recipe[]>(() => toValue(source) ?? [])

  // ── Category filter ────────────────────────────────────────────────
  const { categories } = useCategories()
  const categoryItems = computed(() => [
    { label: 'Toutes', value: '*' },
    ...categories.value.map((c) => ({ label: c, value: c }))
  ])
  const category = ref<string>('*')

  function selectCategory(item: { label: string; value: string }) {
    category.value = item.value
  }

  const byCategory = computed<Recipe[]>(() =>
    category.value !== '*'
      ? recipes.value.filter((r) => r.categories.includes(category.value))
      : recipes.value
  )

  // ── Search ─────────────────────────────────────────────────────────
  const search = ref<string>('')
  const debouncedSearch = refDebounced(search, 300)

  const bySearch = computed<Recipe[]>(() => {
    const term = debouncedSearch.value.trim()
    if (!term || term.length <= 0) return byCategory.value

    const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    return byCategory.value.filter((r) => pattern.test(r.title))
  })

  // ── Sort ───────────────────────────────────────────────────────────
  const sort = ref<SortItem>(recipeSortItems[0]!)

  const results = computed<Recipe[]>(() => {
    const [by, order] = sort.value.value.split('.')
    const dir = order === 'asc' ? 1 : -1

    // Clone first: Array.sort mutates in place, and bySearch can be the raw
    // fetched array — sorting it would mutate reactive source data.
    return [...bySearch.value].sort((a: Recipe, b: Recipe) => {
      if (by === 'created_at') {
        // createdAt arrives as an ISO string over client fetches (only SSR
        // hydration revives a real Date), so coerce before comparing.
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        )
      }
      return a.title.localeCompare(b.title) * dir
    })
  })

  return {
    // category
    categoryItems,
    category,
    selectCategory,
    // search
    search,
    // sort
    sortItems: recipeSortItems,
    sort,
    // output
    results
  }
}
