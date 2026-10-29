import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    watch: {
      // E2E tests copy Vite configs here, which would trigger another test run.
      ignored: ['**/examples-temp-*/**'],
    },
  },
  test: {
    projects: ['packages/*', 'packages/*/benchmark', 'internal-packages/*', './examples'],
  },
})
