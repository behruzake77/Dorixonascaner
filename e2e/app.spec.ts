// ═══════════════════════════════════════════
// E2E Test — Login & Navigation
// Playwright bilan to'liq browser test
// ═══════════════════════════════════════════

import { test, expect } from '@playwright/test';

test.describe('Kirish tizimi', () => {
  test('parol sahifasi ko\'rinadi', async ({ page }) => {
    await page.goto('/');
    // Login sahifaga yo'naltiriladi
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Dorixona Skaner')).toBeVisible();
    await expect(page.locator('input[placeholder*="Parol"]')).toBeVisible();
  });

  test('noto\'g\'ri parol bilan kirish', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="Parol"]', 'notogri-parol');
    await page.click('button:has-text("Kirish")');
    await expect(page.locator('text=Noto\'g\'ri parol')).toBeVisible();
  });

  test('to\'g\'ri parol bilan kirish', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="Parol"]', 'dorixona2025');
    await page.click('button:has-text("Kirish")');
    // Asosiy sahifaga o'tadi
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Skaner')).toBeVisible();
  });
});

test.describe('Navigatsiya', () => {
  test.beforeEach(async ({ page }) => {
    // Login qilish
    await page.goto('/login');
    await page.fill('input[placeholder*="Parol"]', 'dorixona2025');
    await page.click('button:has-text("Kirish")');
    await page.waitForURL('/');
  });

  test('asosiy sahifa elementlari', async ({ page }) => {
    await expect(page.locator('text=Dorixona Skaner')).toBeVisible();
    await expect(page.locator('text=Skaner')).toBeVisible();
    await expect(page.locator('text=Qidirish')).toBeVisible();
    await expect(page.locator('text=Ombor')).toBeVisible();
    await expect(page.locator('text=Tarix')).toBeVisible();
  });

  test('tarix sahifasiga o\'tish', async ({ page }) => {
    await page.click('a:has-text("Tarix")');
    await expect(page).toHaveURL(/history/);
    await expect(page.locator('text=Skanerlash tarixi')).toBeVisible();
  });

  test('admin sahifasiga o\'tish', async ({ page }) => {
    await page.click('a:has-text("Admin")');
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator('text=Admin Panel')).toBeVisible();
  });

  test('sozlamalar sahifasiga o\'tish', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('text=Sozlamalar')).toBeVisible();
    await expect(page.locator('text=Tema')).toBeVisible();
    await expect(page.locator('text=Ovoz')).toBeVisible();
  });
});

test.describe('404 sahifasi', () => {
  test('noto\'g\'ri URL → 404', async ({ page }) => {
    // Login qilish
    await page.goto('/login');
    await page.fill('input[placeholder*="Parol"]', 'dorixona2025');
    await page.click('button:has-text("Kirish")');
    await page.waitForURL('/');

    await page.goto('/bunday-sahifa-yoq');
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Sahifa topilmadi')).toBeVisible();
  });
});
