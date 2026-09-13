<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const links = [
  [
    {
      label: 'Planning',
      to: '/planning',
      icon: 'i-iconoir-calendar',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Recettes',
      to: '/recipes',
      icon: 'i-iconoir-open-book',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Courses',
      to: 'grocery',
      icon: 'i-iconoir-cart',
      onSelect: () => {
        open.value = false
      }
    }
  ]
] satisfies NavigationMenuItem[][]

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title:
      'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [
      {
        label: 'Accept',
        color: 'neutral',
        variant: 'outline',
        onClick: () => {
          cookie.value = 'accepted'
        }
      },
      {
        label: 'Opt out',
        color: 'neutral',
        variant: 'ghost'
      }
    ]
  })
})

const isDarkMode = computed(() => useColorMode().value === 'dark')
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          v-if="!collapsed"
          to="/"
          class="flex items-end gap-2 outline-primary/25 focus-visible:outline-3 rounded-md"
        >
          <Logo class="h-8 w-auto shrink-0" />
          <span class="text-xl font-bold text-highlighted">Ardoise</span>
        </NuxtLink>

        <UDashboardSidebarCollapse class="ms-auto" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UColorModeButton block />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
