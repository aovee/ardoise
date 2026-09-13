<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { recipeInputSchema, type RecipeInput } from '#shared/utils/recipe'

const { categories } = useCategories()

interface IngredientInput {
  name: string
  quantity: {
    amount: string
    unit?: string
  }
}

const props = defineProps<{
  // When present, the form starts pre-filled (edit). Omit for a blank form (add).
  initialValues?: RecipeInput
  // Lets the parent's footer submit button target this form via <button form="...">.
  formId?: string
}>()

const emit = defineEmits<{ submit: [data: RecipeInput] }>()

const formId = props.formId ?? 'recipe-form'

const emptyIngredient = ref<IngredientInput>({
  name: '',
  quantity: {
    amount: '',
    unit: ''
  }
})

function emptyRecipe(): RecipeInput {
  return {
    title: '',
    timers: { preparation: 5, cooking: 5 },
    categories: [],
    ingredients: [emptyIngredient.value],
    image: ''
  }
}

// Deep-clone the initial values so editing the form never mutates the object
// the parent handed us (recipes are plain JSON, so JSON clone is safe + simple).
const state = reactive<RecipeInput>(
  props.initialValues
    ? JSON.parse(JSON.stringify(props.initialValues))
    : emptyRecipe()
)

function addIngredient() {
  state.ingredients.push(emptyIngredient.value)
}

function removeIngredient(n: number) {
  state.ingredients.splice(n, 1)
}

function onSubmit(event: FormSubmitEvent<RecipeInput>) {
  emit('submit', event.data)
}

function onError(event: FormErrorEvent) {
  if (event?.errors?.length) {
    console.log(event.errors)
  }
}

const toast = useToast()
const uploading = ref(false)
const file = ref<File | null>(null)

// UFileUpload writes the picked File here; upload it, then clear the picker so
// our own preview (driven by state.image) is the single source of truth.
watch(file, async (selected) => {
  if (!selected) return

  uploading.value = true
  try {
    const compressed = await compressImage(selected)
    const body = new FormData()
    body.append('file', compressed, 'recipe.webp')
    const { url } = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body
    })
    state.image = url
  } catch {
    toast.add({
      title: 'Erf...',
      description: "Impossible d'envoyer l'image",
      color: 'error'
    })
  } finally {
    uploading.value = false
    file.value = null
  }
})

function onCreate(item: string) {
  categories.value.push(item)

  state.categories.push(item)
}
</script>

<template>
  <UForm
    :id="formId"
    :schema="recipeInputSchema"
    :state="state"
    class="grid grid-cols-1 lg:grid-cols-3 divide-x divide-default"
    @submit="onSubmit"
    @error="onError"
  >
    <div class="lg:col-span-2 space-y-4 p-4 sm:p-6">
      <UFormField label="Titre" name="title">
        <UInput v-model="state.title" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-2 items-center gap-3">
        <UFormField label="Préparation (min)" name="timers.preparation">
          <UInputNumber
            v-model="state.timers.preparation"
            :min="0"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Cuisson (min)" name="timers.cooking">
          <UInputNumber
            v-model="state.timers.cooking"
            :min="0"
            class="w-full"
          />
        </UFormField>
      </div>
      <div>
        <div class="block font-medium text-default mb-2 text-sm">
          Ingrédients
        </div>
        <UFieldGroup
          v-for="(item, count) in state.ingredients"
          :key="count"
          class="grid grid-cols-[min-content_3fr_2fr] grid-rows-1 gap-2 mb-2"
        >
          <div class="row-span-1 flex items-center justify-start">
            <UButton
              variant="outline"
              color="error"
              icon="i-iconoir-trash"
              :disabled="state.ingredients.length === 1"
              size="sm"
              @click="removeIngredient(count)"
            />
          </div>

          <UFormField :name="`ingredients.${count}.name`">
            <UInput v-model="item.name" class="w-full" placeholder="Nom" />
          </UFormField>

          <div class="flex items-center gap-2">
            <UFormField :name="`ingredients.${count}.quantity.amount`">
              <UInput
                v-model="item.quantity.amount"
                placeholder="Quantité"
                class="w-full"
              />
            </UFormField>

            <UFormField :name="`ingredients.${count}.quantity.unit`">
              <UInput
                v-model="item.quantity.unit"
                placeholder="Unité"
                class="w-full"
              />
            </UFormField>
          </div>
        </UFieldGroup>

        <div class="flex items-center justify-center gap-2 mt-5">
          <UButton
            @click="addIngredient"
            label="Ajouter"
            icon="i-iconoir-plus"
            size="sm"
            type="button"
            color="neutral"
          />
        </div>
      </div>
    </div>

    <div class="p-4 sm:p-6 flex flex-col gap-6">
      <UFormField label="Image" name="image">
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-start gap-1.5 w-full">
            <UFileUpload
              v-model="file"
              v-slot="{ open }"
              label="Déposez votre image ici"
              class="min-h-24 w-full"
              :ui="{ base: 'bg-elevated' }"
            >
              <div v-if="state.image" class="mx-auto text-center">
                <UAvatar
                  :src="state.image ? state.image : undefined"
                  class="w-32 h-auto max-w-xs"
                  icon="i-iconoir-media-image"
                />
                <div class="flex items-center gap-2 mt-5">
                  <UButton
                    :label="state.image ? 'Modifier image' : 'Envoyer image'"
                    color="neutral"
                    variant="outline"
                    block
                    size="sm"
                    @click="open()"
                  />

                  <UButton
                    label="Supprimer"
                    color="error"
                    variant="outline"
                    block
                    size="sm"
                    @click="state.image = ''"
                  />
                </div>
              </div>
            </UFileUpload>
            <span v-if="uploading" class="text-xs text-muted"
              >Envoi en cours…</span
            >
          </div>
        </div>
      </UFormField>

      <UFormField label="Catégories">
        <USelectMenu
          v-model="state.categories"
          create-item
          :items="categories"
          multiple
          class="w-full"
          @create="onCreate"
        />
      </UFormField>
    </div>
  </UForm>
</template>
