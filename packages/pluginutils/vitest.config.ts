import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'pluginutils',
    exclude: [...configDefaults.exclude, 'benchmark/**'],
  },
})
