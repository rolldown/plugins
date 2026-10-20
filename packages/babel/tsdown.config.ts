import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/worker.ts'],
  dts: {
    tsconfig: '../../tsconfig.common.json',
  },
})
