<script setup lang="ts">
import { addDays, format, getDay, lastDayOfWeek, parseISO } from 'date-fns'
import {
  buildGroceryList,
  formatGroceryAmount,
  type GroceryItem
} from '#shared/utils/grocery'

useSeoMeta({
  title: 'Votre liste de courses'
})

const rangeOptions = [
  { label: "Jusqu'à dimanche", value: 'week' },
  { label: '7 prochains jours', value: '7' },
  { label: '14 prochains jours', value: '14' }
]
const range = ref('week')

const today = new Date()
const from = format(today, 'yyyy-MM-dd')
const to = computed(() =>
  format(
    range.value === 'week'
      ? lastDayOfWeek(today, { weekStartsOn: 1 })
      : addDays(today, Number(range.value) - 1),
    'yyyy-MM-dd'
  )
)

const { data: mealPlans, pending } = useFetch<MealPlanWithRecipe[]>(
  '/api/meal-plans',
  { query: { from, to } }
)

const items = computed(() => buildGroceryList(mealPlans.value ?? []))

// Checked items are remembered per end date, so a new week starts with a
// fresh list. Initialized on mount to avoid an SSR hydration mismatch.
const checked = useLocalStorage<string[]>(
  () => `grocery-checked:${to.value}`,
  [],
  { initOnMounted: true }
)

function toggle(key: string, value: boolean | 'indeterminate') {
  checked.value = value
    ? [...checked.value, key]
    : checked.value.filter((k) => k !== key)
}

const sortedItems = computed(() =>
  [...items.value].sort(
    (a, b) =>
      Number(checked.value.includes(a.key)) -
      Number(checked.value.includes(b.key))
  )
)

const remaining = computed(
  () => items.value.filter((item) => !checked.value.includes(item.key)).length
)

// "Lasagnes · lun. dîner, Crêpes · mar. déjeuner"
function formatSources(item: GroceryItem) {
  return item.sources
    .map(
      (source) =>
        `${source.recipeTitle} · ${days[getDay(parseISO(source.date))]}. ${mealTypeLabels[source.mealType].toLowerCase()}`
    )
    .join(', ')
}
</script>

<template>
  <UDashboardPanel id="grocery">
    <template #header>
      <UDashboardNavbar title="Liste de courses">
        <template #right>
          <USelect v-model="range" :items="rangeOptions" class="w-44" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-2xl w-full mx-auto flex flex-col gap-4">
        <div v-if="items.length" class="flex items-center justify-between">
          <div class="text-sm text-muted">
            {{ remaining }} article{{ remaining > 1 ? 's' : '' }} restant{{
              remaining > 1 ? 's' : ''
            }}
          </div>
          <UButton
            v-if="checked.length"
            label="Tout décocher"
            icon="i-iconoir-refresh"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="checked = []"
          />
        </div>

        <UEmpty
          v-if="!pending && !items.length"
          icon="i-iconoir-cart"
          title="Rien à acheter"
          description="Aucun repas planifié sur cette période."
          :actions="[{ label: 'Planifier des repas', to: '/planning' }]"
        />

        <ul class="divide-y divide-default">
          <li
            v-for="item in sortedItems"
            :key="item.key"
            class="py-3 transition-opacity"
            :class="checked.includes(item.key) ? 'opacity-50' : ''"
          >
            <UCheckbox
              :model-value="checked.includes(item.key)"
              :ui="{
                label: checked.includes(item.key) ? 'line-through' : '',
                description: 'text-xs'
              }"
              :description="formatSources(item)"
              @update:model-value="toggle(item.key, $event)"
            >
              <template #label>
                <span class="font-semibold">{{ formatGroceryAmount(item) }}</span>
                {{ item.name }}
              </template>
            </UCheckbox>
          </li>
        </ul>
      </div>
    </template>
  </UDashboardPanel>
</template>
