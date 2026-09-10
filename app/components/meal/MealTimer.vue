<script setup lang="ts">
const props = defineProps<{
  type: 'preparation' | 'cooking'
  timer: number
}>()

const timerType = computed(() => props.type === 'preparation' ? 'Préparation' : 'Cuisson')
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <UAvatar :src="`images/${type}.svg`" class="bg-primary/70 dark:bg-primary p-1 mb-1" />
    <div class="font-semibold">{{ timer }} min</div>
    <div class="text-sm">{{ timerType }}</div>
  </div>
</template>