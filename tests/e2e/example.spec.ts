import { test, expect } from '@playwright/test';
import { login, fillForm, clearLocalStorage } from './helpers/test-helpers';

/**
 * Example E2E Test using Helper Functions
 *
 * This demonstrates how to use the test helpers for cleaner tests
 */

test.describe('Example Tests with Helpers', () => {
  test.beforeEach(async ({ page }) => {
    // Clear state before each test
    await clearLocalStorage(page);
  });

  test('should login using helper function', async ({ page }) => {
    // Use the login helper
    await login(page);

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
  });

  test('should fill form using helper function', async ({ page }) => {
    await page.goto('/login');

    // Use fillForm helper
    await fillForm(page, {
      'email': 'admin@example.com',
      'password': 'password123',
    });

    // Submit
    await page.getByRole('button', { name: /login/i }).click();

    // Verify success
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByRole('button', { name: /login/i }).click();

    // Should show validation errors
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Form should still be on login page
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Example Tests with Custom Fixtures', () => {
  // You can import the authenticated test fixture
  // import { test as authenticatedTest } from './fixtures/auth';

  test('should access protected route after login', async ({ page }) => {
    // Login first
    await login(page);

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should be accessible
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Example API Mocking', () => {
  test('should mock API response', async ({ page }) => {
    // Mock the forgot password API
    await page.route('**/api/forgot-password', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset email sent',
        }),
      });
    });

    await page.goto('/forgot-password');

    // Fill and submit form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /send.*reset.*link|reset.*password/i }).click();

    // Should show success message
    await expect(page.getByText(/email.*sent|check.*email/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Example Visual Testing', () => {
  test('should match login page screenshot', async ({ page }) => {
    await page.goto('/login');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual comparison
    // This will fail on first run and create baseline
    // On subsequent runs, it will compare against the baseline
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixels: 100, // Allow small differences
    });
  });
});

test.describe('Example Performance Testing', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    // Login first
    await login(page);

    // Measure navigation time
    const startTime = Date.now();
    await page.goto('/dashboard');
    const endTime = Date.now();

    const loadTime = endTime - startTime;

    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/login');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

      return {
        fcp: fcp?.startTime || 0,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      };
    });

    // FCP should be less than 1.8s (good)
    expect(metrics.fcp).toBeLessThan(1800);
  });
});
