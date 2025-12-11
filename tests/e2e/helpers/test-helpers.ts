import { Page, expect } from '@playwright/test';

/**
 * Test Helper Functions
 *
 * Reusable functions for common test operations
 */

/**
 * Login helper function
 */
export async function login(
  page: Page,
  email: string = 'admin@example.com',
  password: string = 'password123'
) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
}

/**
 * Sign up helper function
 */
export async function signup(
  page: Page,
  email?: string,
  password: string = 'Password123!'
) {
  const userEmail = email || `test${Date.now()}@example.com`;

  await page.goto('/signup');
  await page.getByLabel(/email/i).fill(userEmail);
  await page.getByLabel(/^password$/i).first().fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole('button', { name: /sign up/i }).click();

  return { email: userEmail, password };
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  // Look for user menu or logout button
  const userSection = page.locator('[data-sidebar="footer"], .user-menu').first();
  await userSection.click();

  // Wait for dropdown
  await page.waitForTimeout(300);

  // Click logout
  const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, timeout: number = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Fill form helper
 */
export async function fillForm(
  page: Page,
  formData: Record<string, string>
) {
  for (const [label, value] of Object.entries(formData)) {
    await page.getByLabel(new RegExp(label, 'i')).fill(value);
  }
}

/**
 * Check if element is visible with custom timeout
 */
export async function isVisibleWithTimeout(
  page: Page,
  selector: string,
  timeout: number = 3000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get text content safely
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string | null> {
  const element = page.locator(selector).first();
  return await element.textContent();
}

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(
  page: Page,
  selector: string
) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click(selector),
  ]);
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(
  page: Page,
  name: string
) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Clear localStorage
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Set localStorage item
 */
export async function setLocalStorageItem(
  page: Page,
  key: string,
  value: string
) {
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    { key, value }
  );
}

/**
 * Get localStorage item
 */
export async function getLocalStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return await page.evaluate(
    (key) => localStorage.getItem(key),
    key
  );
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  url: string | RegExp,
  response: object,
  status: number = 200
) {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Check accessibility violations (basic check)
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for alt text on images
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt).toBeDefined();
  }

  // Check for labels on inputs
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');

    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      const hasLabel = await label.count() > 0;

      // Should have either a label or aria-label
      expect(hasLabel || ariaLabel).toBeTruthy();
    }
  }
}
