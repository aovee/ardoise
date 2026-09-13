<script setup lang="ts">
const open = defineModel<boolean>('open')

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :ui="{
      content: 'w-4xl max-w-4xl',
      body: 'p-0 sm:p-0',
      footer: 'justify-end gap-4'
    }"
    scrollable
  >
    <slot />

    <template #body>
      <slot name="body" />
    </template>

    <template #footer>
      <slot name="footer" />
    </template>
  </UModal>
</template>
