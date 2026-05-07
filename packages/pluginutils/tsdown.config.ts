import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'filter/index': './src/filter/index.ts',
  },
  dts: {
    tsconfig: '../../tsconfig.common.json',
    tsgo: true,
  },
})
