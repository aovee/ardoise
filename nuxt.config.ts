export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@nuxt/ui', '@vueuse/nuxt'],

  compatibilityDate: '2025-07-15',

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  // SQLite via NuxtHub. Uses libSQL: locally a file under .data/hub/db, and in
  // production the Turso connection from TURSO_DATABASE_URL / TURSO_AUTH_TOKEN.
  // Migrations in server/db/migrations are applied automatically on dev & build.
  hub: {
    db: 'sqlite'
  }
})
