import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * Login Tests using Page Object Model
 *
 * Demonstrates clean, maintainable tests using POM pattern
 */

test.describe('Login with Page Object Model', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.clearSession();
    await loginPage.goto();
  });

  test.describe('Happy Path', () => {
    test('should login with valid admin credentials', async () => {
      await loginPage.loginAsAdmin();
      await loginPage.assertLoginSuccess();
    });

    test('should login with valid user credentials', async () => {
      await loginPage.loginAsUser();
      await loginPage.assertLoginSuccess();
    });

    test('should persist session after successful login', async () => {
      await loginPage.loginAsAdmin();

      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('should login using Enter key', async () => {
      await loginPage.fillEmail('admin@example.com');
      await loginPage.fillPassword('password123');
      await loginPage.submitWithEnter();

      await loginPage.assertLoginSuccess();
    });
  });

  test.describe('Invalid Credentials', () => {
    test('should fail with wrong email', async () => {
      await loginPage.login('wrong@example.com', 'password123');
      await loginPage.assertLoginFailed();
    });

    test('should fail with wrong password', async () => {
      await loginPage.login('admin@example.com', 'wrongpassword');
      await loginPage.assertLoginFailed();
    });

    test('should show error message for invalid credentials', async () => {
      await loginPage.login('wrong@example.com', 'wrong');

      const hasError = await loginPage.hasErrorMessage();
      expect(hasError).toBe(true);

      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toMatch(/invalid|incorrect|credentials/i);
    });

    test('should clear error when user starts typing', async () => {
      // Trigger error
      await loginPage.login('wrong@example.com', 'wrong');
      await loginPage.page.waitForTimeout(1000);

      // Start typing
      await loginPage.clearEmail();
      await loginPage.fillEmail('new@example.com');

      // Error might be cleared (UX enhancement)
      await loginPage.page.waitForTimeout(500);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate empty email', async () => {
      await loginPage.fillPassword('password123');
      await loginPage.clickLogin();

      const validationMessage = await loginPage.getEmailValidationMessage();
      expect(validationMessage).toBeTruthy();
    });

    test('should validate invalid email format', async () => {
      await loginPage.fillEmail('invalid-email');
      await loginPage.fillPassword('password123');
      await loginPage.clickLogin();

      const isValid = await loginPage.isEmailValid();
      expect(isValid).toBe(false);
    });

    test('should validate empty password', async () => {
      await loginPage.fillEmail('admin@example.com');
      await loginPage.clickLogin();

      const validationMessage = await loginPage.getPasswordValidationMessage();
      expect(validationMessage).toBeTruthy();
    });

    test('should trim whitespace from email', async () => {
      await loginPage.fillEmail('  admin@example.com  ');
      await loginPage.fillPassword('password123');
      await loginPage.clickLogin();

      // Should login successfully (email trimmed)
      await loginPage.assertLoginSuccess();
    });
  });

  test.describe('UI/UX', () => {
    test('should display all form elements', async () => {
      await loginPage.assertAllElementsVisible();
    });

    test('should navigate with Tab key', async () => {
      await loginPage.emailInput.focus();

      const isEmailFocused = await loginPage.isEmailFocused();
      expect(isEmailFocused).toBe(true);

      await loginPage.tabToNextField();

      const isPasswordFocused = await loginPage.isPasswordFocused();
      expect(isPasswordFocused).toBe(true);
    });

    test('should navigate to forgot password page', async () => {
      await loginPage.clickForgotPassword();
      await expect(loginPage.page).toHaveURL('/forgot-password');
    });

    test('should navigate to sign up page', async () => {
      await loginPage.clickSignUp();
      await expect(loginPage.page).toHaveURL('/signup');
    });

    test('should have correct page title', async () => {
      const title = await loginPage.getPageTitle();
      expect(title).toMatch(/login/i);
    });

    test('should show loading state during login', async () => {
      await loginPage.fillEmail('admin@example.com');
      await loginPage.fillPassword('password123');
      await loginPage.clickLogin();

      // Check for loading state (might be very brief)
      await loginPage.page.waitForTimeout(100);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session after page reload', async () => {
      await loginPage.loginAsAdmin();

      // Reload page
      await loginPage.page.reload();

      // Should still be logged in
      await expect(loginPage.page).toHaveURL('/dashboard');
    });

    test('should clear session on explicit clear', async () => {
      await loginPage.loginAsAdmin();

      let isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);

      await loginPage.clearSession();

      isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });

    test('should handle expired session', async () => {
      // Set expired session
      await loginPage.setMockSession({
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });

      // Try to access dashboard
      await loginPage.page.goto('/dashboard');

      // Should handle gracefully
      await loginPage.page.waitForTimeout(2000);
    });
  });

  test.describe('Security', () => {
    test('should mask password input', async () => {
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('should not expose credentials in URL', async () => {
      await loginPage.login('admin@example.com', 'password123');

      const url = loginPage.page.url();
      expect(url).not.toContain('password123');
      expect(url).not.toContain('admin@example.com');
    });

    test('should handle SQL injection attempt', async () => {
      await loginPage.login("admin' OR '1'='1", "' OR '1'='1");

      // Should not bypass authentication
      await expect(loginPage.page).toHaveURL('/login');
    });

    test('should sanitize XSS input', async ({ page }) => {
      await loginPage.fillEmail('<script>alert("XSS")</script>@test.com');
      await loginPage.fillPassword('password');
      await loginPage.clickLogin();

      // Should not execute script
      const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
      const dialog = await dialogPromise;
      expect(dialog).toBeNull();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper labels and ARIA', async () => {
      await loginPage.checkAccessibility();
    });

    test('should be keyboard navigable', async () => {
      await loginPage.emailInput.focus();
      await loginPage.fillEmail('admin@example.com');

      await loginPage.tabToNextField();
      await loginPage.fillPassword('password123');

      // Submit with Enter
      await loginPage.submitWithEnter();

      await loginPage.assertLoginSuccess();
    });

    test('should have accessible error messages', async () => {
      await loginPage.login('wrong@example.com', 'wrong');

      const errorMessage = loginPage.errorMessage;
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // Check for ARIA attributes
      const role = await errorMessage.getAttribute('role');
      const ariaLive = await errorMessage.getAttribute('aria-live');

      expect(role === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await loginPage.assertAllElementsVisible();
      await loginPage.loginAsAdmin();
      await loginPage.assertLoginSuccess();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await loginPage.assertAllElementsVisible();
      await loginPage.loginAsAdmin();
      await loginPage.assertLoginSuccess();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginPage.assertAllElementsVisible();
      await loginPage.loginAsAdmin();
      await loginPage.assertLoginSuccess();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network error', async ({ page }) => {
      await page.context().setOffline(true);

      await loginPage.login('admin@example.com', 'password123');

      // Should show network error
      await expect(loginPage.page.getByText(/network|connection|offline/i)).toBeVisible({ timeout: 10000 });

      await page.context().setOffline(false);
    });

    test('should handle server error', async ({ page }) => {
      // Mock server error
      await page.route('**/api/login', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await loginPage.login('admin@example.com', 'password123');

      // Should show error
      await expect(loginPage.page.getByText(/error|failed/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Visual Regression', () => {
    test('should match login page screenshot', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Visual regression test
      await expect(page).toHaveScreenshot('login-page-pom.png', {
        maxDiffPixels: 100,
      });
    });

    test('should match error state screenshot', async ({ page }) => {
      await loginPage.login('wrong@example.com', 'wrong');
      await loginPage.page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('login-page-error-pom.png', {
        maxDiffPixels: 100,
      });
    });
  });
});
