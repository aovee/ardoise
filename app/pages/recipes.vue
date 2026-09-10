<script setup lang="ts">
const { data: recipes } = await useAsyncData('recipes', () =>
  queryCollection('recipes').all()
)
</script>

<template>
  <UDashboardPanel id="recettes">
    <template #header>
      <UDashboardNavbar title="Recettes" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MealCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
      </div>
    </template>
  </UDashboardPanel>
</template>
