import { test, expect } from '@playwright/test';

test('generator page loads correctly', async ({ page }) => {
  await page.goto('/generator');
  
  // Check that the generator form exists
  const generatorForm = page.locator('form');
  await expect(generatorForm).toBeVisible();
  
  // Check that the platform tabs exist
  const platformTabs = page.locator('.platform-tabs');
  await expect(platformTabs).toBeVisible();
});

test('viral content page loads correctly', async ({ page }) => {
  await page.goto('/viral-content');
  
  // Check that the viral content form exists
  const viralForm = page.locator('form');
  await expect(viralForm).toBeVisible();
  
  // Check that the brand name input exists
  const brandNameInput = page.getByLabel(/brand name/i);
  await expect(brandNameInput).toBeVisible();
});
