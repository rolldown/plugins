import { expect, test } from 'vitest'
import { page } from '~utils'

test('should render relay example title', async () => {
  expect(await page.textContent('.relay-title')).toBe('Relay Example')
})

test('should resolve graphql tagged template to artifact', async () => {
  expect(await page.textContent('.relay-query-name')).toBe('AppQuery')
})

test('should have correct query text from artifact', async () => {
  expect(await page.textContent('.relay-query-text')).toBe('query AppQuery { greeting }')
})
