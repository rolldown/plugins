import fs from 'node:fs'
import path from 'node:path'
import type { Locator } from 'playwright-chromium'
import { inject } from 'vitest'
import { tempDir } from './vitestSetup'

export { page } from './vitestSetup'

export const isBuild = !!inject('isBuild')
export const isServe = !isBuild

export function editFile(file: string, callback: (content: string) => string): void {
  const filePath = path.resolve(tempDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')
  const modified = callback(content)
  fs.writeFileSync(filePath, modified)
}

export async function getColor(locator: Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el).color)
}

export async function getBg(locator: Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el).backgroundColor)
}
