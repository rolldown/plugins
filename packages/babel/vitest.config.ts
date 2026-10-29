import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'babel',
    exclude: [...configDefaults.exclude, 'benchmark/**'],
  },
})
