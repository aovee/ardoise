<script setup lang="ts">
import type { Recipe, RecipeInput } from '#shared/utils/recipe'

const props = defineProps<{ recipe: Recipe }>()
const open = defineModel<boolean>('open')
const emit = defineEmits<{ saved: [] }>()

const toast = useToast()

async function onSubmit(data: RecipeInput) {
  try {
    await $fetch(`/api/recipes/${props.recipe.id}`, {
      method: 'PUT',
      body: data
    })
    toast.add({
      title: 'Modifiée !',
      description: `Recette ${data.title} mise à jour`,
      color: 'success'
    })
    open.value = false
    emit('saved')
  } catch {
    toast.add({
      title: 'Erf...',
      description: 'Impossible de modifier la recette',
      color: 'error'
    })
  }
}
</script>

<template>
  <RecipeModalWrapper
    v-model:open="open"
    title="Modifier la recette"
    description="Mets à jour les détails de la recette"
  >
    <template #body>
      <RecipeForm
        v-if="open"
        :key="recipe.id"
        :initial-values="recipe"
        form-id="recipe-edit"
        @submit="onSubmit"
      />
    </template>

    <template #footer>
      <UButton
        label="Annuler"
        color="neutral"
        variant="subtle"
        icon="i-iconoir-nav-arrow-left"
        @click="open = false"
      />
      <UButton
        label="Enregistrer"
        icon="i-iconoir-check"
        color="primary"
        variant="solid"
        type="submit"
        form="recipe-edit"
      />
    </template>
  </RecipeModalWrapper>
</template>
