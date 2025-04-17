import { test, expect } from '@playwright/test';

test('homepage has correct title and hero section', async ({ page }) => {
  await page.goto('/');
  
  // Check the title
  await expect(page).toHaveTitle(/Noisy/);
  
  // Check that the hero section exists
  const heroSection = page.locator('.hero-section');
  await expect(heroSection).toBeVisible();
  
  // Check that the main CTA button exists
  const ctaButton = page.getByRole('button', { name: /create viral content/i });
  await expect(ctaButton).toBeVisible();
});

test('navigation menu works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that the navigation menu exists
  const navMenu = page.locator('nav');
  await expect(navMenu).toBeVisible();
  
  // Check that the About link exists and works
  const aboutLink = page.getByRole('link', { name: /about/i });
  await expect(aboutLink).toBeVisible();
  
  // Click the About link and verify navigation
  await aboutLink.click();
  await expect(page).toHaveURL(/.*about/);
});

test('mobile navigation works correctly', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 390, height: 844 });
  
  await page.goto('/');
  
  // Check that the mobile navigation exists
  const mobileNav = page.locator('.mobile-nav');
  await expect(mobileNav).toBeVisible();
  
  // Check that the bottom navigation bar exists on mobile
  const bottomNav = page.locator('.bottom-nav');
  await expect(bottomNav).toBeVisible();
});
