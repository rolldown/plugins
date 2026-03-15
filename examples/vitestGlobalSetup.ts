import fs from 'node:fs'
import path from 'node:path'
import type { TestProject } from 'vitest/node'
import type { BrowserServer } from 'playwright-chromium'
import { chromium } from 'playwright-chromium'

let tempBaseDir: string | undefined
let browserServer: BrowserServer | undefined

export async function setup({ provide, config }: TestProject): Promise<void> {
  browserServer = await chromium.launchServer({
    headless: !process.env.VITE_DEBUG_SERVE,
    args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : undefined,
  })
  provide('wsEndpoint', browserServer.wsEndpoint())

  const isBuild = !!config.provide.isBuild
  tempBaseDir = path.join(import.meta.dirname, `../examples-temp-${isBuild ? 'build' : 'dev'}`)
  const tsconfigBaseDest = path.join(tempBaseDir, './tsconfig.base.json')

  if (!fs.existsSync(tempBaseDir)) {
    fs.mkdirSync(tempBaseDir, { recursive: true })
  }
  if (!fs.existsSync(tsconfigBaseDest)) {
    fs.copyFileSync(path.join(import.meta.dirname, './tsconfig.base.json'), tsconfigBaseDest)
  }
  provide('tempBaseDir', tempBaseDir)
}

export async function teardown(): Promise<void> {
  await browserServer?.close()
  if (fs.existsSync(tempBaseDir!)) {
    fs.rmSync(tempBaseDir!, { recursive: true, force: true })
  }
}
