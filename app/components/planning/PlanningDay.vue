<script setup lang="ts">
import { format, getDay } from 'date-fns'

const props = defineProps<{
  date: Date
}>()

const isToday = computed(() => new Date().getDate() === props.date.getDate())
</script>

<template>
  <div
    class="h-full p-4 flex flex-col gap-8"
    :class="isToday ? 'bg-primary/10 border-primary border-r' : ''"
  >
    <div class="flex items-baseline gap-2">
      <div
        class="uppercase text-xs tracking-widest"
        :class="isToday ? 'text-primary' : 'text-muted'"
      >
        {{ days[getDay(date)] }}
      </div>
      <div
        class="text-lg font-semibold"
        :class="isToday ? 'text-primary' : 'text-muted'"
      >
        {{ format(date, 'd') }}
      </div>
    </div>

    <div>
      <UPageCard
        icon="i-iconoir-plus"
        description="Ajouter un repas"
        :ui="{ wrapper: 'flex-row gap-5' }"
      />
    </div>
  </div>
</template>
