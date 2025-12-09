import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 *
 * Tests for sign-up, login, forgot password, and reset password flows
 */

test.describe('Authentication Flow', () => {
  test.describe('Sign Up', () => {
    test('should display sign up form', async ({ page }) => {
      await page.goto('/signup');

      // Check page title
      await expect(page).toHaveTitle(/Sign Up/i);

      // Check form elements exist
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/signup');

      // Fill invalid email
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/^password$/i).first().fill('Password123!');
      await page.getByLabel(/confirm password/i).fill('Password123!');

      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();

      // Check for validation error
      await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with mismatched passwords
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password$/i).first().fill('Password123!');
      await page.getByLabel(/confirm password/i).fill('DifferentPassword123!');

      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();

      // Check for error
      await expect(page.getByText(/password.*not match|passwords must match/i)).toBeVisible();
    });

    test('should successfully sign up with valid credentials', async ({ page }) => {
      await page.goto('/signup');

      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;

      // Fill valid form data
      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/^password$/i).first().fill('Password123!');
      await page.getByLabel(/confirm password/i).fill('Password123!');

      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();

      // Should redirect to dashboard or show success message
      await expect(page).toHaveURL(/\/(dashboard|login)/);
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      // Check form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /forgot.*password/i })).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill invalid credentials
      await page.getByLabel(/email/i).fill('wrong@example.com');
      await page.getByLabel(/password/i).fill('WrongPassword123!');

      // Submit form
      await page.getByRole('button', { name: /login/i }).click();

      // Check for error message
      await expect(page.getByText(/invalid.*credentials|incorrect.*email.*password/i)).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');

      // Use mock credentials from LocalStorageAuthRepository
      await page.getByLabel(/email/i).fill('admin@example.com');
      await page.getByLabel(/password/i).fill('password123');

      // Submit form
      await page.getByRole('button', { name: /login/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

      // Verify dashboard content
      await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login');

      // Click forgot password link
      await page.getByRole('link', { name: /forgot.*password/i }).click();

      // Should navigate to forgot password page
      await expect(page).toHaveURL('/forgot-password');
    });
  });

  test.describe('Forgot Password', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      // Check form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send.*reset.*link|reset.*password/i })).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/forgot-password');

      // Fill invalid email
      await page.getByLabel(/email/i).fill('invalid-email');

      // Submit form
      await page.getByRole('button', { name: /send.*reset.*link|reset.*password/i }).click();

      // Check for validation error
      await expect(page.getByText(/invalid.*email|valid email/i)).toBeVisible();
    });

    test('should show success message with valid email', async ({ page }) => {
      await page.goto('/forgot-password');

      // Fill valid email
      await page.getByLabel(/email/i).fill('test@example.com');

      // Submit form
      await page.getByRole('button', { name: /send.*reset.*link|reset.*password/i }).click();

      // Check for success message
      await expect(page.getByText(/email.*sent|check.*email|reset.*link.*sent/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Reset Password', () => {
    test('should display reset password form with valid token', async ({ page }) => {
      // Navigate with a mock token
      await page.goto('/reset-password?token=mock-valid-token');

      // Check form elements
      await expect(page.getByLabel(/new password/i)).toBeVisible();
      await expect(page.getByLabel(/confirm.*password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /reset.*password/i })).toBeVisible();
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/reset-password?token=mock-valid-token');

      // Fill mismatched passwords
      await page.getByLabel(/new password/i).fill('NewPassword123!');
      await page.getByLabel(/confirm.*password/i).fill('DifferentPassword123!');

      // Submit form
      await page.getByRole('button', { name: /reset.*password/i }).click();

      // Check for error
      await expect(page.getByText(/password.*not match|passwords must match/i)).toBeVisible();
    });

    test('should show error with invalid token', async ({ page }) => {
      await page.goto('/reset-password?token=invalid-token');

      // Fill form
      await page.getByLabel(/new password/i).fill('NewPassword123!');
      await page.getByLabel(/confirm.*password/i).fill('NewPassword123!');

      // Submit form
      await page.getByRole('button', { name: /reset.*password/i }).click();

      // Check for error
      await expect(page.getByText(/invalid.*token|expired.*token/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Accessibility', () => {
    test('login page should be accessible', async ({ page }) => {
      await page.goto('/login');

      // Check ARIA labels
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toHaveAttribute('aria-label');

      // Check form has proper structure
      await expect(page.locator('form')).toBeVisible();

      // Check keyboard navigation
      await page.keyboard.press('Tab');
      await expect(emailInput).toBeFocused();
    });

    test('sign up page should have proper form labels', async ({ page }) => {
      await page.goto('/signup');

      // All inputs should have associated labels
      const inputs = await page.locator('input[type="email"], input[type="password"]').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });
  });
});
