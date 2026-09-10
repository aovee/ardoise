<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: "fr",
  },
  title: "Ardoise",
  titleTemplate: (title) =>
    title !== "Ardoise" ? `${title} · Ardoise` : title,
  meta: [
    {
      name: "description",
      content: "Liste des courses et repas, le tout simplement",
    },
    // { property: 'og:image', content: 'https://movies.nuxt.space/social-card.png' },
    // { name: 'twitter:card', content: 'summary_large_image' },
    // { name: 'twitter:site', content: '@nuxt_js' },
    // { name: 'twitter:creator', content: '@nuxt_js' },
  ],
  // link: [
  //   {
  //     rel: 'icon',
  //     type: 'image/webp',
  //     href: '/movies.webp',
  //   },
  // ],
});
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
