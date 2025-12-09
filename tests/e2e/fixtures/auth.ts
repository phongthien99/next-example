import { test as base, Page } from '@playwright/test';

/**
 * Authentication Fixtures
 *
 * Custom fixtures for authenticated testing
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Extended test with authenticated page fixture
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Fixture that provides an authenticated page
   * Automatically logs in before each test
   */
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form with mock credentials
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');

    // Submit login form
    await page.getByRole('button', { name: /login/i }).click();

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Use the authenticated page
    await use(page);

    // Cleanup after test (optional)
    // Could logout here if needed
  },
});

export { expect } from '@playwright/test';
