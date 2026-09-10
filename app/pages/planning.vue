<script setup lang="ts">
import { addDays, lastDayOfWeek, startOfWeek } from 'date-fns'

const today = computed(() => new Date())

const firstWeekDay = computed(() =>
  startOfWeek(today.value, { weekStartsOn: 1 })
)

const lastWeekDay = computed(() =>
  lastDayOfWeek(today.value, { weekStartsOn: 1 })
)

const week = computed(() => {
  const grid = []
  let flag = firstWeekDay.value
  for (let i = 0; i <= 6; i++) {
    const newDay = i === 0 ? flag : addDays(flag, i)
    grid.push(newDay)
  }

  return grid
})
</script>

<template>
  <UDashboardPanel id="week" :ui="{ body: 'py-0 sm:py-0' }">
    <template #header>
      <UDashboardNavbar :ui="{ title: 'flex items-center gap-3' }">
        <template #title>
          <div class="text-2xl">Semaine</div>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-iconoir-nav-arrow-left"
              variant="outline"
              size="xs"
            />
            <WeekLabel :start="firstWeekDay" :end="lastWeekDay" />
            <UButton
              icon="i-iconoir-nav-arrow-right"
              variant="outline"
              size="xs"
            />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        class="h-screen grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 divide-default divide-x"
      >
        <PlanningDay v-for="n in week" :key="n.getTime()" :date="n" />
      </div>
    </template>
  </UDashboardPanel>
</template>
