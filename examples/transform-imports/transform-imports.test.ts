import { expect, test } from 'vitest'
import { page } from '~utils'

test('should render button component', async () => {
  const el = page.locator('.mock-button')
  const text = await el.textContent()
  expect(text).toBe('Button')
})

test('should render card component', async () => {
  const el = page.locator('.mock-card')
  const text = await el.textContent()
  expect(text).toBe('Card')
})

test('should render modal component', async () => {
  const el = page.locator('.mock-modal')
  const text = await el.textContent()
  expect(text).toBe('Modal')
})
