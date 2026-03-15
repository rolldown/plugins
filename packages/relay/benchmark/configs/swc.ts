import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import { withFilter } from 'rolldown/filter'
import swc from '@rollup/plugin-swc'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/swc'),
  },
  plugins: [
    withFilter(
      swc({
        swc: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'preserve',
              },
            },
            experimental: {
              plugins: [
                [
                  '@swc/plugin-relay',
                  {
                    rootDir: resolve(import.meta.dirname, '..'),
                    artifactDirectory: 'shared-app/src/__generated__',
                    language: 'typescript',
                    eagerEsModules: true,
                  },
                ],
              ],
            },
          },
        },
      }),
      {
        transform: {
          id: { include: /\.[jt]sx?$/, exclude: /node_modules/ },
          code: { include: /graphql/ },
        },
      },
    ),
  ],
})
