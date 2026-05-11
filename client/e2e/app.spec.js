import { test, expect } from '@playwright/test'

test.describe('LeadFlow UI', () => {
  test('shows main heading and opens new lead modal', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
    await page.getByRole('button', { name: /new lead/i }).click()
    await expect(page.getByRole('heading', { name: /^new lead$/i })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('heading', { name: /^new lead$/i })).toBeHidden()
  })

  test('slash focuses search', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('/')
    await expect(page.getByPlaceholder(/search name, company, or phone/i)).toBeFocused()
  })

  test('status filters are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^new$/i })).toBeVisible()
  })
})
