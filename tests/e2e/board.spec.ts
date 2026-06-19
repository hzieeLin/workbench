import { test, expect } from '@playwright/test'

test.describe('Board View', () => {
  test('displays the core board view', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.board-view')).toBeVisible()
  })

  test('can create a new board', async ({ page }) => {
    await page.goto('/')
    await page.locator('.board-section > button').click()
    await page.locator('.board-section input').fill('E2E Core Board')
    await page.locator('.board-section form button').last().click()
    await expect(page.locator('.board-name', { hasText: 'E2E Core Board' })).toBeVisible()
  })
})
