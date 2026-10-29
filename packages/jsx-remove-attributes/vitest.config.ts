import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'jsx-remove-attributes',
    exclude: [...configDefaults.exclude, 'benchmark/**'],
  },
})
