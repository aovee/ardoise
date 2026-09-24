<script setup lang="ts">
import { format } from 'date-fns'
import {
  mealTypeLabels,
  mealTypes,
  type MealType
} from '#shared/utils/mealPlan'

const props = defineProps<{
  date: Date
  mealTypeValue: MealType
}>()

const emit = defineEmits<{ saved: [] }>()

const open = ref(false)

const recipes = ref<Recipe[]>([])
const loadingRecipes = ref(false)
const search = ref('')
const selectedRecipe = ref<Recipe | null>(null)
const mealType = ref<MealType>(props.mealTypeValue)
const servings = ref(1)
const saving = ref(false)

const mealTypeItems = mealTypes.map((value) => ({
  label: mealTypeLabels[value],
  value
}))

watch(open, async (value) => {
  if (!value) return

  // Reset the flow each time the modal is (re)opened.
  selectedRecipe.value = null
  mealType.value = props.mealTypeValue
  servings.value = 1
  search.value = ''

  if (recipes.value.length <= 0) {
    loadingRecipes.value = true
    try {
      recipes.value = await $fetch<Recipe[]>('/api/recipes')
    } finally {
      loadingRecipes.value = false
    }
  }
})

const filteredRecipes = computed(() => {
  const term = search.value.trim()
  if (!term) return recipes.value

  const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  return recipes.value.filter((recipe) => pattern.test(recipe.title))
})

function selectRecipe(recipe: Recipe) {
  selectedRecipe.value = recipe
  // Default to the recipe's usual number of parts — the person planning the
  // meal can still scale it up or down for who's actually eating that day.
  servings.value = recipe.servings || 1
}

const toast = useToast()

async function onSubmit() {
  if (!selectedRecipe.value) return

  saving.value = true
  try {
    await $fetch('/api/meal-plans', {
      method: 'POST',
      body: {
        date: format(props.date, 'yyyy-MM-dd'),
        mealType: mealType.value,
        recipeId: selectedRecipe.value.id,
        servings: servings.value
      }
    })
    toast.add({
      title: "C'est bon !",
      description: `${selectedRecipe.value.title} ajoutée au planning`,
      color: 'success'
    })
    open.value = false
    emit('saved')
  } catch {
    toast.add({
      title: 'Erf...',
      description: "Impossible d'ajouter ce repas au planning",
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    title="Ajouter un repas"
    :description="selectedRecipe ? undefined : 'Choisis une recette'"
    v-model:open="open"
    :ui="{ body: 'p-0 sm:p-0', footer: 'justify-end gap-4' }"
    scrollable
    class="w-full"
  >
    <UPageCard
      icon="i-iconoir-plus"
      description="Ajouter un repas"
      class="clickable w-full hover:ring-primary"
      :ui="{ wrapper: 'flex-row gap-5' }"
    />

    <template #body>
      <div v-if="!selectedRecipe" class="flex flex-col">
        <div class="p-4 sm:p-6 pb-3 sm:pb-3">
          <UInput
            v-model="search"
            class="w-full"
            placeholder="Rechercher une recette"
            icon="i-iconoir-search"
          />
        </div>

        <div v-if="loadingRecipes" class="p-6 text-center text-muted">
          Chargement des recettes...
        </div>
        <div
          v-else-if="filteredRecipes.length <= 0"
          class="p-6 text-center text-muted"
        >
          Aucune recette trouvée
        </div>
        <div v-else class="max-h-96 overflow-y-auto divide-y divide-default">
          <button
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            type="button"
            class="w-full flex items-center gap-3 p-3 sm:px-6 text-left hover:bg-elevated transition-colors cursor-pointer"
            @click="selectRecipe(recipe)"
          >
            <img
              v-if="recipe.image"
              :src="recipe.image"
              :alt="recipe.title"
              class="size-10 rounded object-cover shrink-0"
            />
            <div class="min-w-0">
              <div class="font-medium truncate">{{ recipe.title }}</div>
              <div class="text-xs text-muted">
                {{ recipe.servings }} part{{ recipe.servings > 1 ? 's' : '' }}
              </div>
            </div>
          </button>
        </div>
      </div>

      <div v-else class="p-4 sm:p-6 flex flex-col gap-6">
        <div class="flex items-center gap-3">
          <img
            v-if="selectedRecipe.image"
            :src="selectedRecipe.image"
            :alt="selectedRecipe.title"
            class="size-10 rounded object-cover shrink-0"
          />
          <div class="font-medium">{{ selectedRecipe.title }}</div>
        </div>

        <UFormField label="Repas" name="mealType">
          <URadioGroup
            v-model="mealType"
            :items="mealTypeItems"
            orientation="horizontal"
            variant="card"
          />
        </UFormField>

        <UFormField label="Nombre de personnes" name="servings">
          <UInputNumber v-model="servings" :min="1" class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <template v-if="selectedRecipe">
        <UButton
          label="Retour"
          color="neutral"
          variant="subtle"
          icon="i-iconoir-nav-arrow-left"
          @click="selectedRecipe = null"
        />
        <UButton
          label="Ajouter"
          icon="i-iconoir-check"
          color="primary"
          :loading="saving"
          @click="onSubmit"
        />
      </template>
      <UButton
        v-else
        label="Annuler"
        color="neutral"
        variant="subtle"
        @click="open = false"
      />
    </template>
  </UModal>
</template>
