import { expect, test } from 'vitest'
import { editFile, isBuild, isServe, page } from '~utils'

test('should render content correctly', async () => {
  expect(await page.textContent('.title')).toBe('Jsx Remove Attributes Works!')
})

test('should render description', async () => {
  expect(await page.textContent('.description')).toBe(
    'Testing attributes are removed in production.',
  )
})

test.runIf(isBuild)('data-testid attributes are removed in production', async () => {
  const titleTestId = await page.getAttribute('.title', 'data-testid')
  expect(titleTestId).toBeNull()
})

test.runIf(isBuild)('non-matching attributes are preserved', async () => {
  const customAttr = await page.getAttribute('.description', 'data-custom')
  expect(customAttr).toBe('keep-me')
})

test.runIf(isServe)('hmr works', async () => {
  editFile('src/App.tsx', (code) => code.replace('Jsx Remove Attributes Works!', 'HMR Updated!'))
  await expect
    .poll(async () => {
      return page.textContent('.title')
    })
    .toBe('HMR Updated!')
})
