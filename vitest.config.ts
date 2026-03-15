import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*', 'packages/*/benchmark', 'internal-packages/*', './examples'],
  },
})
