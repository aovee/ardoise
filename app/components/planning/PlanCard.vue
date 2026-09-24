<script setup lang="ts">
const props = defineProps<{
  plan: MealPlanWithRecipe
}>()

const toast = useToast()
const emits = defineEmits<{ deleted: [] }>()
const showDeleteModal = ref<boolean>(false)

async function onDelete() {
  try {
    await $fetch(`/api/meal-plans/${props.plan.id}`, { method: 'DELETE' })
    showDeleteModal.value = false
    emits('deleted')
  } catch {
    toast.add({
      title: 'Erf...',
      description: 'Impossible de supprimer ce repas',
      color: 'error'
    })
  }
}
</script>

<template>
  <UPageCard
    :title="plan.recipe.title"
    :description="`${plan.servings} personne${plan.servings > 1 ? 's' : ''}`"
    highlight
    :ui="{
      title: 'text-ellipsis overflow-hidden',
      wrapper: 'flex-row gap-5'
    }"
  >
    <template #footer>
      <UButton
        icon="i-iconoir-trash"
        variant="ghost"
        color="error"
        size="xs"
        @click="showDeleteModal = true"
      />
    </template>

    <UModal
      v-model:open="showDeleteModal"
      title="Retirer un repas"
      :description="`Êtes-vous sûr de vouloir retirer la recette ${plan.recipe.title} pour ce jour ?`"
      :ui="{ footer: 'justify-end' }"
    >
      <template #footer="{ close }">
        <UButton
          color="neutral"
          icon="i-iconoir-nav-arrow-left"
          label="Annuler"
          @click="close"
        />
        <UButton
          color="error"
          icon="i-iconoir-trash"
          label="Retirer"
          @click="onDelete"
        />
      </template>
    </UModal>
  </UPageCard>
</template>
