import { expect, test } from 'vitest'
import { page, isServe, editFile } from '~utils'

test('should render app', async () => {
  expect(await page.textContent('.jotai-title')).toBe('Jotai Works!')
})

test('counter should work', async () => {
  const count = page.locator('.jotai-count')
  expect(await count.textContent()).toBe('Count: 0')

  await page.click('.jotai-button')
  expect(await count.textContent()).toBe('Count: 1')

  const double = page.locator('.jotai-double')
  expect(await double.textContent()).toBe('Double: 2')
})

test.runIf(isServe)('hmr works', async () => {
  editFile('src/App.tsx', (code) => code.replace('Jotai Works!', 'Jotai HMR!'))
  await expect
    .poll(async () => {
      return page.textContent('.jotai-title')
    })
    .toBe('Jotai HMR!')
})
