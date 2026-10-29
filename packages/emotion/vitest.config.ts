import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'emotion',
    exclude: [...configDefaults.exclude, 'benchmark/**'],
  },
})
