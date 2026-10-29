import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'oxc-unshadowed-visitor',
    exclude: [...configDefaults.exclude, 'benchmark/**'],
  },
})
