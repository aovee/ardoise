<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { recipeInputSchema, type RecipeInput } from '#shared/utils/recipe'

const props = defineProps<{
  // When present, the form starts pre-filled (edit). Omit for a blank form (add).
  initialValues?: RecipeInput
  // Lets the parent's footer submit button target this form via <button form="...">.
  formId?: string
}>()

const emit = defineEmits<{ submit: [data: RecipeInput] }>()

const formId = props.formId ?? 'recipe-form'

function emptyRecipe(): RecipeInput {
  return {
    title: '',
    timers: { preparation: 5, cooking: 5 },
    categories: [],
    ingredients: [],
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
  state.ingredients.push({ name: '', quantity: { amount: '', unit: '' } })
}

function removeIngredient() {
  state.ingredients.pop()
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
</script>

<template>
  <UForm
    :id="formId"
    :schema="recipeInputSchema"
    :state="state"
    class="grid grid-cols-3 divide-x divide-default"
    @submit="onSubmit"
    @error="onError"
  >
    <div class="col-span-2 space-y-4 p-4 sm:p-6">
      <UFormField label="Titre" name="title">
        <UInput v-model="state.title" class="w-full" variant="subtle" />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-3">
        <UFormField label="Préparation (min)" name="timers.preparation">
          <UInputNumber
            v-model="state.timers.preparation"
            :min="0"
            class="w-full"
            variant="subtle"
          />
        </UFormField>
        <UFormField label="Cuisson (min)" name="timers.cooking">
          <UInputNumber
            v-model="state.timers.cooking"
            :min="0"
            class="w-full"
            variant="subtle"
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
          class="grid grid-cols-5 gap-2 mb-2"
        >
          <UFormField :name="`ingredients.${count}.name`" class="col-span-3">
            <UInput
              v-model="item.name"
              class="w-full"
              variant="subtle"
              placeholder="Nom"
            />
          </UFormField>
          <UFormField :name="`ingredients.${count}.quantity.amount`">
            <UInput
              v-model="item.quantity.amount"
              variant="subtle"
              placeholder="Quantité"
            />
          </UFormField>
          <UFormField :name="`ingredients.${count}.quantity.unit`">
            <UInput
              v-model="item.quantity.unit"
              variant="subtle"
              placeholder="Unité"
            />
          </UFormField>
        </UFieldGroup>

        <div class="flex items-center gap-2 mt-3">
          <UButton
            @click="addIngredient"
            label="Ajouter"
            icon="i-iconoir-plus"
            size="sm"
            type="button"
            color="neutral"
          />
          <UButton
            v-if="state.ingredients.length > 0"
            @click="removeIngredient"
            label="Retirer"
            icon="i-iconoir-trash"
            size="sm"
            type="button"
            variant="ghost"
            color="error"
          />
        </div>
      </div>
    </div>

    <div class="p-4 sm:p-6">
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
              <div v-if="state.image">
                <UAvatar
                  :src="state.image ? state.image : undefined"
                  class="w-full h-auto"
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

      <UFormField>

      </UFormField>
    </div>
  </UForm>
</template>
