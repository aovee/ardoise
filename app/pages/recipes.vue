<
<script setup lang="ts">
interface SortItem {
  label: string
  value: string
}

useSeoMeta({
  title: 'Liste des recettes'
})

const { data: recipes, pending, refresh } = useFetch('/api/recipes')

const {
  categoryItems,
  category: categoryFilter,
  selectCategory: applyCategoryFilter,
  search,
  sortItems,
  sort,
  results: sortedRecipes
} = useRecipeFilters(recipes)

const showAddModal = ref<boolean>(false)
const debouncedSearch = refDebounced(search, 300)

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
  <UDashboardPanel id="recipes">
    <template #header>
      <UDashboardNavbar
        class="items-start"
        :toggle="false"
        :ui="{
          root: 'items-start flex-col gap-4 xl:flex-row',
          title: 'flex flex-col items-start gap-4',
          left: 'w-full',
          right:
            'flex flex-col justify-start xl:justify-between gap-4 items-end h-full w-full xl:w-auto'
        }"
      >
        <template #title>
          <div class="text-3xl">
            <UDashboardSidebarToggle />
            Recettes
          </div>
          <div class="hidden lg:flex text-muted text-sm">
            {{ recipes?.length || 'Aucune' }} recette{{
              (recipes?.length || 0) > 0 ? 's' : ''
            }}
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="(category, k) in categoryItems"
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
          <div class="flex items-center gap-4 w-full">
            <UInput
              v-model="search"
              class="w-full xl:w-xs"
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
            :trailing-icon="false"
            :ui="{
              content: 'min-w-fit px-2',
              leadingIcon: 'text-primary'
            }"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-6"
      >
        <div
          v-if="pending || (recipes && recipes.length <= 0)"
          class="col-span-1 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-5 min-h-[calc(100svh-var(--ui-header-height)-48px)] flex justify-center items-center"
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
>
