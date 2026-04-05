import { expect, test } from 'vitest'
import { getColor, page } from '~utils'

test('should render scoped text in red', async () => {
  const el = page.locator('.scoped-text')
  const color = await getColor(el)
  expect(color).toBe('rgb(255, 0, 0)')
})

test('should render global text in blue', async () => {
  const el = page.locator('.global-text')
  const color = await getColor(el)
  expect(color).toBe('rgb(0, 0, 255)')
})

test('should render external text in teal', async () => {
  const el = page.locator('.external-text')
  const color = await getColor(el)
  expect(color).toBe('rgb(0, 128, 128)')
})
