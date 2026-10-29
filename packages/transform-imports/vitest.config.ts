import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'transform-imports',
    exclude: [...configDefaults.exclude, 'benchmark/**'],
  },
})
