<script setup lang="ts">
import type { RecipesCollectionItem } from '@nuxt/content'

defineProps<{
  recipe: RecipesCollectionItem
}>()
</script>

<template>
  <UCard
    variant="subtle"
    :title="recipe.title"
    :ui="{ title: 'text-lg', description: 'pt-7' }"
  >
    <template #description>
      <div class="grid md:grid-cols-2 gap-3 divide-x divide-default">
        <MealTimer type="preparation" :timer="recipe.timers.preparation" />
        <MealTimer type="cooking" :timer="recipe.timers.cooking" />
      </div>
    </template>

    <div class="text-center">
      <UAvatar :src="recipe.image" :alt="recipe.title" class="size-48" />
    </div>

    <div class="mt-6">
      <div class="flex flex-wrap items-center justify-center gap-6">
        <div
          v-for="ingredient in recipe.ingredients"
          class="min-w-24 flex flex-col items-center justify-center text-center"
        >
          <div class="font-semibold text-sm">
            {{ ingredient.quantity.amount }} {{ ingredient.quantity.unit }}
          </div>
          <div class="text-sm text-muted">{{ ingredient.name }}</div>
        </div>
      </div>
    </div>
  </UCard>
</template>
