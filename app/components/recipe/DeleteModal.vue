<script setup lang="ts">
const open = defineModel<boolean>('open')
const emit = defineEmits<{ deleted: [] }>()
</script>

<template>
  <UModal
    v-model:open="open"
    title="Attention"
    description="Souhaitez-vous réellement supprimer cette recette ?"
    :ui="{ footer: 'justify-end gap-4' }"
  >
    <template #footer>
      <UButton
        label="Annuler"
        color="neutral"
        variant="subtle"
        icon="i-iconoir-nav-arrow-left"
        @click="open = false"
      />
      <UButton
        label="Supprimer"
        icon="i-iconoir-trash"
        color="error"
        variant="solid"
        @click="emit('deleted')"
      />
    </template>
  </UModal>
</template>
