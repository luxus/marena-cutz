import { expect, test } from '@playwright/test';

// ─── Homepage ─────────────────────────────────────────────────────────────

test.describe('Homepage', () => {
  test('loads with 200 and shows the shop name', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Marena/i);
  });

  test('hero section is visible', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
  });

  test('hero headline is visible after entrance animation', async ({ page }) => {
    await page.goto('/');
    const headline = page.locator('main h1');
    await expect(headline).toBeVisible();
    await expect(headline).toContainText(/Clean Cuts/i);
    const line = page.locator('main h1 span.hero-slide-left');
    await expect(line).toBeVisible();
    await page.waitForTimeout(2000);
    const opacity = await line.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.9);
  });

  test('core sections stay scannable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#preise')).toBeVisible();
    await expect(page.locator('#standort')).toBeVisible();
    await expect(page.locator('#ueber')).toBeVisible();
    await expect(page.locator('#barbers')).toBeVisible();
    await expect(page.locator('#social')).toBeVisible();
    await expect(page.getByRole('heading', { name: /preise/i })).toBeVisible();
  });

  test('does not invent prices — published barber rates remain', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('45 CHF').first()).toBeVisible();
    await expect(page.getByText('35 CHF').first()).toBeVisible();
  });

  test('main nav links are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header a[href="#preise"]')).toBeVisible();
  });

  test('footer is present with legal links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer a[href="/impressum/"]')).toBeVisible();
    await expect(page.locator('footer a[href="/datenschutz/"]')).toBeVisible();
  });

  test('sticky mobile nav is visible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: /termin/i }).first()).toBeVisible();
  });
});

// ─── Booking Drawer ────────────────────────────────────────────────────────

test.describe('Booking drawer', () => {
  test('opens when the booking trigger is clicked', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: /termin/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
  });

  test('closes when the close button is clicked', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: /termin/i }).first();
    await trigger.click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

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

test.describe('Hero photo', () => {
  test('is a full-bleed photo with no WebGL craft piece', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero-stage, #fade-ribbon, canvas')).toHaveCount(0);
    await expect(page.locator('#hero img')).toHaveCount(1);
    await page.waitForTimeout(2800);
    await expect(page.locator('#hero img')).toBeVisible();
  });

  test('reduced motion keeps the headline readable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const headline = page.locator('main h1');
    await expect(headline).toBeVisible();
    const opacity = await headline.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.9);
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
