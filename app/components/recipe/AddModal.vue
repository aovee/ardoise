<script setup lang="ts">
import type { RecipeInput } from '#shared/utils/recipe'

const open = defineModel<boolean>('open')
const emit = defineEmits<{ saved: [] }>()

const toast = useToast()

async function onSubmit(data: RecipeInput) {
  try {
    await $fetch('/api/recipes', { method: 'POST', body: data })
    toast.add({
      title: "C'est bon !",
      description: `Nouvelle recette ${data.title} ajoutée`,
      color: 'success'
    })
    open.value = false
    emit('saved')
  } catch {
    toast.add({
      title: 'Erf...',
      description: "Impossible d'ajouter la nouvelle recette",
      color: 'error'
    })
  }
}
</script>

<template>
  <RecipeModalWrapper
    v-model:open="open"
    title="Nouvelle recette"
    description="Ajoute une nouvelle recette à la liste disponible"
  >
    <UButton
      label="Nouvelle recette"
      icon="i-iconoir-plus"
      color="neutral"
      class="px-3 py-2"
    />

    <template #body>
      <RecipeForm v-if="open" form-id="recipe-add" @submit="onSubmit" />
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
        form="recipe-add"
      />
    </template>
  </RecipeModalWrapper>
</template>
