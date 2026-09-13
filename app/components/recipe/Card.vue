<script setup lang="ts">
const props = defineProps<{
  recipe: Recipe
}>()

const emit = defineEmits<{ saved: []; deleted: [] }>()

const showEditModal = ref(false)
const showDeleteModal = ref(false)

const toast = useToast()
async function onDelete() {
  try {
    await $fetch(`/api/recipes/${props.recipe.id}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Modifiée !',
      description: `Recette ${props.recipe.title} supprimée`,
      color: 'success'
    })
    emit('deleted')
  } catch {
    toast.add({
      title: 'Erf...',
      description: 'Impossible de supprimer la recette',
      color: 'error'
    })
  }
}

const totalRecipeTime = computed(
  () => props.recipe.timers.cooking + props.recipe.timers.preparation
)
</script>

<template>
  <UPageCard
    :title="recipe.title"
    variant="subtle"
    reverse
    class="hover:cursor-pointer hover:ring-primary transition-all duration-200"
    :ui="{
      container:
        'grid grid-cols-[max-content_1fr] md:grid-cols-1 p-0 sm:p-0 gap-0',
      body: 'w-full',
      title: 'pt-2',
      description: 'flex flex-col items-start gap-2 text-sm text-muted w-full',
      wrapper: 'px-4 sm:px-6 pb-3'
    }"
    @click="showEditModal = true"
  >
    <template #description>
      <div>
        {{ totalRecipeTime }} min · {{ recipe.ingredients.length }} ingrédients
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          v-for="category in recipe.categories"
          :label="category"
          class="rounded-full uppercase px-3 py-2"
          variant="outline"
        />
      </div>
    </template>

    <div
      v-if="recipe.image"
      class="flex justify-center items-center bg-primary/10 p-2"
    >
      <img :src="recipe.image" :alt="recipe.title" class="size-10 md:size-48" />
    </div>

    <RecipeEditModal
      v-model:open="showEditModal"
      :recipe="recipe"
      @saved="emit('saved')"
    />

    <RecipeDeleteModal v-model:open="showDeleteModal" @deleted="onDelete" />
  </UPageCard>
</template>
