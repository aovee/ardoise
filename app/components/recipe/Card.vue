<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  recipe: Recipe
}>()

const emit = defineEmits<{ saved: []; deleted: [] }>()

const showEditModal = ref(false)
const showDeleteModal = ref(false)

const menuItems: DropdownMenuItem[][] = [
  [
    {
      label: 'Modifier',
      icon: 'i-iconoir-edit',
      onSelect: () => {
        showEditModal.value = true
      }
    }
  ],
  [
    {
      label: 'Supprimer',
      icon: 'i-iconoir-trash',
      color: 'error' as const,
      onSelect: () => {
        showDeleteModal.value = true
      }
    }
  ]
]

const toast = useToast()
async function onDelete() {
  try {
    await $fetch(`/api/recipes/${props.recipe.id}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Modifiée !',
      description: `Recette ${props.recipe.title} supprimée`,
      color: 'success'
    })
    emit('deleted')
  } catch {
    toast.add({
      title: 'Erf...',
      description: 'Impossible de supprimer la recette',
      color: 'error'
    })
  }
}

const totalRecipeTime = computed(
  () => props.recipe.timers.cooking + props.recipe.timers.preparation
)
</script>

<template>
  <UPageCard
    :title="recipe.title"
    variant="subtle"
    orientation="vertical"
    reverse
    class="hover:cursor-pointer hover:ring-primary transition-all duration-200"
    :ui="{
      container: 'p-0 sm:p-0',
      body: 'w-full',
      description: 'flex items-center gap-1 text-sm text-muted w-full',
      wrapper: 'px-4 sm:px-6 pb-3'
    }"
    @click="showEditModal = true"
  >
    <template #description>
      {{ totalRecipeTime }} min · {{ recipe.ingredients.length }} ingrédients
    </template>

    <div v-if="recipe.image" class="flex justify-center bg-primary/10 py-2">
      <img :src="recipe.image" :alt="recipe.title" class="size-48" />
    </div>

    <RecipeEditModal
      v-model:open="showEditModal"
      :recipe="recipe"
      @saved="emit('saved')"
    />

    <RecipeDeleteModal v-model:open="showDeleteModal" @deleted="onDelete" />
  </UPageCard>
</template>
