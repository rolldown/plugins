import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'styled-jsx',
    exclude: [...configDefaults.exclude, 'benchmark/**'],
  },
})
