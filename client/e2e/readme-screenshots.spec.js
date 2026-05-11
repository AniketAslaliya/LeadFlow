import fs from 'fs/promises'
import path from 'path'
import { test, expect } from '@playwright/test'

const repoRoot = path.resolve(process.cwd(), '..')
const shotDir = path.join(repoRoot, 'docs', 'screenshots')

async function ensureTheme(page, mode) {
  for (let i = 0; i < 6; i++) {
    const t = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    if (t === mode) return
    await page.getByRole('button', { name: /switch to (light|dark) mode/i }).click()
  }
}

/** Side‑by‑side PNG for reviewers who asked for one asset showing both themes. */
async function captureThemeComparison(page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
  await ensureTheme(page, 'dark')
  const darkBuf = await page.screenshot({ type: 'png' })

  await ensureTheme(page, 'light')
  const lightBuf = await page.screenshot({ type: 'png' })

  const b64d = darkBuf.toString('base64')
  const b64l = lightBuf.toString('base64')
  const w = 1440
  await page.setViewportSize({ width: w * 2, height: 980 })
  await page.setContent(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;background:#0a0a0a;font-family:system-ui,sans-serif">
  <div style="display:flex;color:#e5e5e5;padding:14px 20px;gap:0;font-size:13px;font-weight:600;letter-spacing:0.02em;border-bottom:1px solid #262626">
    <span style="flex:1;text-align:center">Dark theme</span>
    <span style="flex:1;text-align:center">Light theme</span>
  </div>
  <div style="display:flex;align-items:flex-start;line-height:0">
    <img alt="" style="width:${w}px;display:block" src="data:image/png;base64,${b64d}"/>
    <img alt="" style="width:${w}px;display:block" src="data:image/png;base64,${b64l}"/>
  </div>
</body></html>`)
  await page.screenshot({
    path: path.join(shotDir, 'theme-dark-and-light.png'),
    fullPage: true,
  })
}

test.describe.configure({ mode: 'serial' })

test.describe('README screenshots', () => {
  test.beforeAll(async () => {
    await fs.mkdir(shotDir, { recursive: true })
  })

  test('01 theme comparison (dark + light in one file)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await captureThemeComparison(page)
  })

  test('02 workspace — list, sections, sort', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
    await ensureTheme(page, 'dark')
    await page.screenshot({
      path: path.join(shotDir, 'feature-workspace.png'),
      fullPage: true,
    })
  })

  test('03 status filters + search + sort', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
    await ensureTheme(page, 'dark')
    await page.getByRole('button', { name: /^qualified$/i }).click()
    const search = page.getByPlaceholder(/search name, company, or phone/i)
    await search.fill('globex')
    await page.screenshot({
      path: path.join(shotDir, 'feature-filters-search.png'),
      fullPage: true,
    })
  })

  test('04 new lead modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
    await ensureTheme(page, 'dark')
    await page.getByRole('button', { name: /new lead/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: /^new lead$/i })).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, 'feature-new-lead.png'),
      fullPage: true,
    })
    await page.keyboard.press('Escape')
  })

  test('05 lead dialog — timeline, status, contact', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
    await ensureTheme(page, 'dark')
    await page.locator('button').filter({ has: page.locator('h3') }).first().click()
    await expect(page.locator('#lead-dialog-title')).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, 'feature-lead-dialog.png'),
      fullPage: true,
    })
    await page.keyboard.press('Escape')
  })

  test('06 phone — country / dial search (combobox)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /^LeadFlow$/i })).toBeVisible()
    await ensureTheme(page, 'dark')
    await page.getByRole('button', { name: /new lead/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /country calling code/i }).click()
    const dialCombo = dialog.getByRole('combobox')
    await expect(dialCombo).toBeFocused()
    await dialCombo.fill('UK')
    await page.screenshot({
      path: path.join(shotDir, 'feature-phone-picker.png'),
      fullPage: true,
    })
  })
})
