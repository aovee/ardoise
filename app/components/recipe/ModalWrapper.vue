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
      content: 'w-auto lg:w-4xl xl:w-5xl max-w-4xl xl:max-w-5xl',
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
