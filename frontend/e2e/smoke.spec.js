import { test, expect } from '@playwright/test';

test('visitor can navigate the responsive portfolio', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await page.goto('/ai');
  await expect(page.getByRole('heading', { name: 'Fahiz AI' })).toBeVisible();
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: 'Start a conversation' })).toBeVisible();
  await page.goto('/meetings');
  await expect(page.getByRole('heading', { name: /meeting/i })).toBeVisible();
});

test('public pages expose dynamic SEO metadata', async ({ page }) => {
  await page.goto('/projects');
  await expect(page).toHaveTitle(/Projects/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /project/i);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Projects/);
});

test('mobile pages do not overflow the viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile layout check');
  for (const path of ['/', '/projects', '/contact', '/meetings', '/ai']) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('admin route redirects anonymous visitors', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
