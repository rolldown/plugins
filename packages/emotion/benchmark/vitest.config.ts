import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'benchmark-emotion',
    testTimeout: 60_000,
  },
})
