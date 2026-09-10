<script setup lang="ts">
import { format, isSameMonth } from 'date-fns'

const props = defineProps<{
  start: Date
  end: Date
}>()

const areBothSameMonth = computed(() => isSameMonth(props.end, props.start))
</script>

<template>
  <div>
    {{ format(props.start, 'd') }}
    {{ areBothSameMonth ? '' : format(props.start, 'LLL') + '.' }}
  </div>
  <div>-</div>
  <div>{{ format(props.end, 'd') }} {{ format(props.end, 'LLL') }}.</div>
</template>
