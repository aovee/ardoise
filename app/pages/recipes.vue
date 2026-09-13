<script setup lang="ts">
interface SortItem {
  label: string
  value: string
}

useSeoMeta({
  title: 'Liste des recettes'
})

const { data: recipes, pending, refresh } = useFetch('/api/recipes')

const { categories } = useCategories()
const categoriesFilterItems = computed(() => [
  {
    label: 'Toutes',
    value: '*'
  },
  ...categories.value.map((c) => ({ label: c, value: c }))
])
const categoryFilter = ref<string>('*')

const sortItems: SortItem[] = [
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
const sort = ref<SortItem>(sortItems[0]!)

const showAddModal = ref<boolean>(false)
const search = ref<string>('')
const debouncedSearch = refDebounced(search, 300)

function applyCategoryFilter(category: { label: string; value: string }) {
  categoryFilter.value = category.value
}

const prefilteredRecipes = computed<Recipe[]>(() => {
  if (!recipes.value) return [] as Recipe[]

  return categoryFilter.value !== '*'
    ? recipes.value.filter((r) => r.categories.includes(categoryFilter.value))
    : recipes.value
})

const filteredRecipes = computed<Recipe[]>(() => {
  if (!prefilteredRecipes.value) return [] as Recipe[]

  const term = debouncedSearch.value.trim()
  if (!term || term.length <= 0) return prefilteredRecipes.value

  const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

  return prefilteredRecipes.value.filter((r) => pattern.test(r.title))
})

const sortedRecipes = computed<Recipe[]>(() => {
  const [by, order] = sort.value.value.split('.')
  const dir = order === 'asc' ? 1 : -1

  // Clone first: Array.sort mutates in place, and filteredRecipes can be the
  // raw fetched array — sorting it would mutate reactive source data.
  return [...filteredRecipes.value].sort((a: Recipe, b: Recipe) => {
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

const actions = computed(() => [
  {
    icon: 'i-lucide-plus',
    label: 'Nouvelle recette',
    loading: pending.value,
    onClick() {
      showAddModal.value = true
    }
  },
  {
    icon: 'i-lucide-refresh-cw',
    label: 'Actualiser',
    color: 'neutral' as const,
    variant: 'subtle' as const,
    loading: pending.value,
    onClick: () => refresh()
  }
])
</script>

<template>
  <UDashboardPanel id="recettes">
    <template #header>
      <UDashboardNavbar
        class="items-start"
        :ui="{
          title: 'flex flex-col items-start gap-4',
          right: 'flex flex-col justify-between items-end h-full'
        }"
      >
        <template #title>
          <div class="text-3xl">Recettes</div>
          <div class="text-muted text-sm">
            {{ recipes?.length || 'Aucune' }} recette{{
              (recipes?.length || 0) > 0 ? 's' : ''
            }}
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="(category, k) in categoriesFilterItems"
              :key="k"
              class="rounded-full py-2 px-3 clickable"
              :variant="
                categoryFilter === category.value ? 'subtle' : 'outline'
              "
              :color="categoryFilter === category.value ? 'primary' : 'neutral'"
              size="lg"
              @click="applyCategoryFilter(category)"
            >
              {{ category.label }}
            </UButton>
          </div>
        </template>
        <template #right>
          <div class="flex items-center gap-4">
            <UInput
              v-model="search"
              class="w-xs"
              placeholder="Rechercher par nom, ingrédient"
              icon="i-iconoir-search"
              :ui="{
                base: 'px-3 py-2',
                leadingIcon: 'size-4'
              }"
            />
            <RecipeAddModal v-model:open="showAddModal" @saved="refresh()" />
          </div>
          <USelectMenu
            v-model="sort"
            :items="sortItems"
            icon="i-iconoir-sort"
            label-key="label"
            variant="ghost"
            class="w-min text-primary"
            :search-input="false"
            :ui="{
              leadingIcon: 'text-primary',
              trailingIcon: 'hidden'
            }"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
      >
        <div
          v-if="pending || (recipes && recipes.length <= 0)"
          class="col-span-1 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6 min-h-[calc(100svh-var(--ui-header-height)-48px)] flex justify-center items-center"
        >
          <UEmpty
            icon="i-lucide-file"
            :loading="pending"
            :title="pending ? 'Chargement' : 'Aucune recette'"
            :description="
              pending
                ? 'Récupération des recettes en cours...'
                : 'Il semblerait que vous n\'ayez ajouté aucune recette. Créez en une pour commencer.'
            "
            :actions="actions"
            class="w-lg"
          />
        </div>
        <RecipeCard
          v-else
          v-for="recipe in sortedRecipes"
          :key="recipe.id"
          :recipe="recipe"
          @saved="refresh()"
          @deleted="refresh()"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
