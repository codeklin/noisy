import { test, expect } from '@playwright/test';

test('login page loads correctly', async ({ page }) => {
  await page.goto('/login');
  
  // Check that the login form exists
  const loginForm = page.locator('form');
  await expect(loginForm).toBeVisible();
  
  // Check that the email and password inputs exist
  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/password/i);
  
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  
  // Check that the login button exists
  const loginButton = page.getByRole('button', { name: /login|sign in/i });
  await expect(loginButton).toBeVisible();
});

test('register page loads correctly', async ({ page }) => {
  await page.goto('/register');
  
  // Check that the registration form exists
  const registerForm = page.locator('form');
  await expect(registerForm).toBeVisible();
  
  // Check that the name, email, and password inputs exist
  const nameInput = page.getByLabel(/name/i);
  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/password/i);
  
  await expect(nameInput).toBeVisible();
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  
  // Check that the register button exists
  const registerButton = page.getByRole('button', { name: /register|sign up/i });
  await expect(registerButton).toBeVisible();
});
