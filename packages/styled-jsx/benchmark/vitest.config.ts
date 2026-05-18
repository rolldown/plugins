import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'benchmark-styled-jsx',
    testTimeout: 60_000,
  },
})
