<script setup lang="ts">
const { data: recipes, pending, refresh } = useFetch('/api/recipes')

const showAddModal = ref<boolean>(false)

const actions = computed(() => [
  {
    icon: 'i-lucide-plus',
    label: 'Nouvelle recette',
    onClick() {
      showAddModal.value = true
    }
  },
  {
    icon: 'i-lucide-refresh-cw',
    label: 'Actualiser',
    color: 'neutral' as const,
    variant: 'subtle' as const,
    onClick: () => refresh()
  }
])
</script>

<template>
  <UDashboardPanel id="recettes">
    <template #header>
      <UDashboardNavbar title="Recettes" :ui="{ title: 'text-xl' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <RecipeAddModal v-model:open="showAddModal" @saved="refresh()" />
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
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
          @saved="refresh()"
          @deleted="refresh()"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
