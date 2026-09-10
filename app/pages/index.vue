<script setup lang="ts"></script>

<template>
  <UDashboardPanel id="Home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body> home </template>
  </UDashboardPanel>
</template>
