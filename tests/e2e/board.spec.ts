import { test, expect } from '@playwright/test'

test.describe('Board View', () => {
  test('displays board view', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2')).toContainText('选择一个看板')
  })

  test('can create a new board', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("新建看板")')
    await page.fill('input[placeholder="看板名称"]', 'My Test Board')
    await page.click('button:has-text("创建")')
    await expect(page.locator('text=My Test Board')).toBeVisible()
  })
})
