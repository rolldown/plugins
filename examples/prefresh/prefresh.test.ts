import { expect, test } from 'vitest'
import { editFile, isServe, page } from '~utils'

test('should render app', async () => {
  expect(await page.textContent('.prefresh-title')).toBe('Prefresh Works!')
})

test('context should provide value', async () => {
  expect(await page.textContent('.prefresh-theme')).toBe('Current theme: dark')
})

test.runIf(isServe)('hmr works', async () => {
  // Toggle theme to 'blue' via button (component state change)
  await page.click('.prefresh-toggle')
  await expect.poll(async () => page.textContent('.prefresh-theme')).toBe('Current theme: blue')

  // Trigger HMR by editing the title
  editFile('src/App.tsx', (code) => code.replace('Prefresh Works!', 'Prefresh HMR!'))
  await expect.poll(async () => page.textContent('.prefresh-title')).toBe('Prefresh HMR!')

  // Verify toggled context value survived HMR (state + createContext memoization)
  expect(await page.textContent('.prefresh-theme')).toBe('Current theme: blue')
})
