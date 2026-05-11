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
    await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
    await page.keyboard.press('/')
    await expect(page.getByPlaceholder(/search name, company, or phone/i)).toBeFocused()
  })

  test('status filters are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^new$/i })).toBeVisible()
  })

  test('theme toggle changes data-theme on html', async ({ page }) => {
    await page.goto('/')
    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    await page.getByRole('button', { name: /switch to (light|dark) mode/i }).click()
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(after).not.toBe(before)
    expect(['light', 'dark']).toContain(after)
  })

  test('new lead modal exposes dialog semantics', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /new lead/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog.getByRole('heading', { name: /^new lead$/i })).toBeVisible()
  })

  test('new lead modal panel has consistent border radius on all corners', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /new lead/i }).click()
    const dialog = page.locator('[role="dialog"]')
    const radii = await dialog.evaluate((el) => {
      const s = getComputedStyle(el)
      return {
        tl: s.borderTopLeftRadius,
        tr: s.borderTopRightRadius,
        bl: s.borderBottomLeftRadius,
        br: s.borderBottomRightRadius,
      }
    })
    expect(radii.tl).toBeTruthy()
    expect(radii.tl).toBe(radii.tr)
    expect(radii.tl).toBe(radii.bl)
    expect(radii.tl).toBe(radii.br)
  })

  test('phone country combobox filters and sets aria-activedescendant', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /new lead/i }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: /country calling code/i }).click()
    const combo = dialog.getByRole('combobox')
    await expect(combo).toBeFocused()
    // Unique match (e.g. "India" also matches "Indonesia" via substring)
    await combo.fill('Ireland')
    await expect(dialog.getByRole('option', { name: /\+353/ })).toBeVisible()
    await expect(combo).toHaveAttribute('aria-activedescendant', 'add-lead-phone-opt-353')
  })
})
