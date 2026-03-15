import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './src/index.ts',
  dts: {
    tsconfig: '../../tsconfig.common.json',
    tsgo: true,
  },
})
