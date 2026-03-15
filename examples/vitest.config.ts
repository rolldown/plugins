import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

const timeout = process.env.CI ? 6000 : 3000

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(import.meta.dirname, './test-utils.ts'),
    },
  },
  test: {
    setupFiles: ['./vitestSetup.ts'],
    globalSetup: ['./vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    reporters: 'dot',
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'e2e:dev',
          env: {
            // set here to override Vitest's default `"test"`
            NODE_ENV: 'development',
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e:build',
          provide: {
            isBuild: '1',
          },
          env: {
            // set here to override Vitest's default `"test"`
            NODE_ENV: 'production',
          },
        },
      },
    ],
  },
})
