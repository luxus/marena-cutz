import { expect, test } from '@playwright/test';

// ─── Homepage ─────────────────────────────────────────────────────────────

test.describe('Homepage', () => {
  test('loads with 200 and shows the shop name', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    // The page title contains the shop name from settings.md
    await expect(page).toHaveTitle(/Marena/i);
  });

  test('hero section is visible', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('#hero, section').first();
    await expect(hero).toBeVisible();
  });

  test('hero headline is visible after entrance animation', async ({ page }) => {
    await page.goto('/');
    const headline = page.locator('main h1 span.hero-slide-left');
    await expect(headline).toBeVisible();
    // Production CSS minification once broke split animation rules (opacity stuck at 0).
    await page.waitForTimeout(2000);
    const opacity = await headline.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.9);
  });

  test('main nav links are present', async ({ page }) => {
    await page.goto('/');
    // Header is present
    await expect(page.locator('header')).toBeVisible();
  });

  test('footer is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });
});

// ─── Booking Drawer ────────────────────────────────────────────────────────

test.describe('Booking drawer', () => {
  test('opens when the booking trigger is clicked', async ({ page }) => {
    await page.goto('/');

    // BookingTrigger renders a button with label "Termin" (default)
    const trigger = page.getByRole('button', { name: /termin/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    // Drawer renders with role="dialog"
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
  });

  test('closes when the close button is clicked', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: /termin/i }).first();
    await trigger.click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

    // Drawer close button has aria-label="Schließen"
    await page.getByRole('button', { name: /schließen/i }).click();
    await expect(drawer).not.toBeVisible();
  });
});

// ─── Light / dark toggle ─────────────────────────────────────────────────────

test.describe('Light/dark toggle', () => {
  test('mode toggle is visible and switches data-mode', async ({ page }) => {
    await page.goto('/');

    const toggleBtn = page.getByRole('button', { name: /hell- oder dunkelmodus/i });
    await expect(toggleBtn).toBeVisible();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'architectural');

    const modeBefore = await page.locator('html').getAttribute('data-mode');
    const expectedMode = modeBefore === 'dark' ? 'light' : 'dark';
    await toggleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', expectedMode);
  });
});

// ─── Legal pages ──────────────────────────────────────────────────────────

test.describe('Legal pages', () => {
  test('impressum loads', async ({ page }) => {
    const res = await page.goto('/impressum');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('datenschutz loads', async ({ page }) => {
    const res = await page.goto('/datenschutz');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
});
