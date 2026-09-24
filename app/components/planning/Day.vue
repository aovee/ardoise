<script setup lang="ts">
import { format, getDay } from 'date-fns'
import { mealTypeLabels, mealTypes } from '#shared/utils/mealPlan'

const props = defineProps<{
  date: Date
}>()

const isToday = computed(() => new Date().getDate() === props.date.getDate())

const isoDate = computed(() => format(props.date, 'yyyy-MM-dd'))

const { data: mealPlans, refresh } = useFetch<MealPlanWithRecipe[]>(
  '/api/meal-plans',
  { query: { date: isoDate } }
)

const mealPlansByType = computed(() => {
  const grid = { lunch: [], dinner: [] } as Record<
    MealType,
    MealPlanWithRecipe[]
  >
  for (const plan of mealPlans.value ?? []) {
    grid[plan.mealType].push(plan)
  }
  return grid
})
</script>

<template>
  <div
    class="h-full p-4 flex flex-col gap-6"
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

    <div class="grid grid-rows-2 h-full">
      <div
        v-for="type in mealTypes"
        :key="type"
        class="flex flex-col gap-4 w-full"
      >
        <div class="uppercase text-xs tracking-widest text-muted">
          {{ mealTypeLabels[type] }}
        </div>

        <PlanningRecipeAddModal
          v-if="mealPlansByType[type].length <= 0"
          :date="date"
          @saved="refresh()"
          :meal-type-value="type"
        />
        <PlanningPlanCard
          v-for="plan in mealPlansByType[type]"
          :key="plan.id"
          :plan="plan"
          @deleted="refresh()"
        />
      </div>
    </div>
  </div>
</template>
