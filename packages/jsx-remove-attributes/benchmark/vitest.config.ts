import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'benchmark-jsx-remove-attributes',
    testTimeout: 60_000,
  },
})
