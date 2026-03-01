import { expect, test } from 'vitest'
import { editFile, getBg, getColor, isServe, page } from '~utils'

test('should render app', async () => {
  expect(await page.textContent('.emotion-title')).toBe('Emotion Works!')
})

test('styled component should apply styles', async () => {
  const title = page.locator('.emotion-title')
  const color = await getColor(title)
  expect(color).toBe('rgb(255, 105, 180)') // hotpink
})

test('css prop should work', async () => {
  const button = page.locator('.emotion-button')
  const bgColor = await getBg(button)
  expect(bgColor).toBe('rgb(100, 108, 255)') // #646cff
})

test.runIf(isServe)('hmr works', async () => {
  editFile('src/App.tsx', (code) => code.replace('hotpink', 'blue'))
  await expect
    .poll(async () => {
      const title = page.locator('.emotion-title')
      return getColor(title)
    })
    .toBe('rgb(0, 0, 255)') // blue
})
