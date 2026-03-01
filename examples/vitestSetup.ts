import fs from 'node:fs'
import path from 'node:path'
import type { Browser, Page } from 'playwright-chromium'
import { chromium } from 'playwright-chromium'
import type { InlineConfig, ViteDevServer } from 'vite'
import { build, createServer, preview } from 'vite'
import { beforeAll, afterAll, inject } from 'vitest'

let server: ViteDevServer | { close: () => Promise<void>; resolvedUrls: { local: string[] } }
export let tempDir: string
let browser: Browser
export let page: Page
let rootDir: string

const isBuild = !!inject('isBuild')

// oxlint-disable-next-line no-empty-pattern
beforeAll(async ({}, suite) => {
  const wsEndpoint = inject('wsEndpoint')
  if (!wsEndpoint) {
    throw new Error('WS_ENDPOINT not found')
  }

  browser = await chromium.connect(wsEndpoint)
  page = await browser.newPage()

  // Get the test file path to determine which example to run
  const testFile = suite.file?.filepath
  if (!testFile) {
    throw new Error('Could not determine test file path')
  }

  // Extract example name from path: examples/{example}/xxx.spec.ts
  const match = testFile.match(/examples[/\\]([^/\\]+)/)
  if (!match) {
    throw new Error(`Could not determine example from test file: ${testFile}`)
  }
  const exampleName = match[1]

  // Set up root directory (the example directory)
  rootDir = path.resolve(import.meta.dirname, exampleName)

  // Create temp directory for this example to allow HMR edits
  const tempBase = inject('tempBaseDir')
  tempDir = path.join(tempBase, `${exampleName}-${Date.now()}`)

  // Copy example to temp directory
  fs.cpSync(rootDir, tempDir, {
    recursive: true,
    filter(file) {
      file = file.replace(/\\/g, '/')
      return !file.includes('__tests__') && !/dist(?:\/|$)/.test(file)
    },
  })

  const testConfig: InlineConfig = {
    root: tempDir,
    logLevel: 'silent',
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
  }

  if (isBuild) {
    await build(testConfig)
    const previewServer = await preview({
      ...testConfig,
      preview: {
        port: 0,
        strictPort: false,
      },
    })
    server = {
      close: async () => {
        previewServer.httpServer?.close()
      },
      resolvedUrls: {
        local: [
          // oxlint-disable-next-line no-unsafe-type-assertion -- address() returns AddressInfo for TCP server
          `http://localhost:${(previewServer.httpServer?.address() as { port: number })?.port || 4173}/`,
        ],
      },
    }
  } else {
    server = await createServer(testConfig)
    await server.listen()
  }

  const url = server.resolvedUrls?.local[0]
  if (!url) {
    throw new Error('Could not get server URL')
  }

  await page.goto(url)
})

afterAll(async () => {
  await page?.close()
  await server?.close()
  if (tempDir && tempDir !== rootDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})

declare module 'vitest' {
  export interface ProvidedContext {
    wsEndpoint: string
    tempBaseDir: string
    isBuild: string
  }
}
