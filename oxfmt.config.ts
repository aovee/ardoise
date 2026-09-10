import { defineConfig } from 'oxfmt'

export default defineConfig({
  ignorePatterns: [
    // Vendored/generated files that are not ours to format.
    '.agents/**',
    '.claude/**',
    '.skilld/**',
    'evlog.map.json',
    'content/**' // Nuxt Content MDC — not standard Markdown; oxfmt mangles component blocks
  ],
  printWidth: 80,
  semi: false,
  trailingComma: 'none',
  singleQuote: true
})
