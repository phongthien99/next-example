import { Page, Locator, expect } from '@playwright/test';

/**
 * Login Page Object Model
 *
 * Encapsulates all interactions with the login page
 * Provides reusable methods for testing login functionality
 */
export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly googleLoginButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole('button', { name: /^login$/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i });
    this.signUpLink = page.getByRole('link', { name: /sign up|create account|register/i }).first();
    this.googleLoginButton = page.getByRole('button', { name: /google/i });
    this.errorMessage = page.getByText(/invalid.*credentials|incorrect|wrong|error/i);
    this.loadingIndicator = page.getByText(/logging|loading/i);
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Wait for login page to fully load
   */
  async waitForPageLoad() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Complete login flow
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Login and wait for success
   */
  async loginAndWaitForSuccess(email: string, password: string) {
    await this.login(email, password);
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  /**
   * Login with admin credentials (default test user)
   */
  async loginAsAdmin() {
    await this.loginAndWaitForSuccess('admin@example.com', 'password123');
  }

  /**
   * Login with user credentials
   */
  async loginAsUser() {
    await this.loginAndWaitForSuccess('user@example.com', 'password123');
  }

  /**
   * Submit form using Enter key
   */
  async submitWithEnter() {
    await this.passwordInput.press('Enter');
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Click sign up link
   */
  async clickSignUp() {
    await this.signUpLink.click();
  }

  /**
   * Click Google login button
   */
  async clickGoogleLogin() {
    await this.googleLoginButton.click();
  }

  /**
   * Get email input value
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Get password input value
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Check if email input is focused
   */
  async isEmailFocused(): Promise<boolean> {
    return await this.emailInput.evaluate((el) => el === document.activeElement);
  }

  /**
   * Check if password input is focused
   */
  async isPasswordFocused(): Promise<boolean> {
    return await this.passwordInput.evaluate((el) => el === document.activeElement);
  }

  /**
   * Check if error message is visible
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.hasErrorMessage()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Check if loading indicator is visible
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingIndicator.isVisible().catch(() => false);
  }

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  /**
   * Get email validation message
   */
  async getEmailValidationMessage(): Promise<string> {
    return await this.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  }

  /**
   * Get password validation message
   */
  async getPasswordValidationMessage(): Promise<string> {
    return await this.passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  }

  /**
   * Check if email input is valid
   */
  async isEmailValid(): Promise<boolean> {
    return await this.emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
  }

  /**
   * Check if password input is valid
   */
  async isPasswordValid(): Promise<boolean> {
    return await this.passwordInput.evaluate((el: HTMLInputElement) => el.checkValidity());
  }

  /**
   * Clear email field
   */
  async clearEmail() {
    await this.emailInput.clear();
  }

  /**
   * Clear password field
   */
  async clearPassword() {
    await this.passwordInput.clear();
  }

  /**
   * Clear both fields
   */
  async clearForm() {
    await this.clearEmail();
    await this.clearPassword();
  }

  /**
   * Navigate using Tab key
   */
  async tabToNextField() {
    await this.page.keyboard.press('Tab');
  }

  /**
   * Check if all form elements are visible
   */
  async assertAllElementsVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  /**
   * Assert that login was successful
   */
  async assertLoginSuccess() {
    await expect(this.page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(this.page.getByText(/dashboard|welcome/i)).toBeVisible();
  }

  /**
   * Assert that login failed
   */
  async assertLoginFailed() {
    await expect(this.page).toHaveURL('/login');
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert specific error message
   */
  async assertErrorMessage(expectedMessage: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }

  /**
   * Get stored session from localStorage
   */
  async getStoredSession(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem('auth_session'));
  }

  /**
   * Get stored auth token from localStorage
   */
  async getStoredAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem('auth_token'));
  }

  /**
   * Check if user is logged in (has valid session)
   */
  async isLoggedIn(): Promise<boolean> {
    const session = await this.getStoredSession();
    const token = await this.getStoredAuthToken();
    return !!(session || token);
  }

  /**
   * Clear stored session
   */
  async clearSession() {
    await this.page.evaluate(() => {
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_token');
      localStorage.clear();
    });
  }

  /**
   * Set mock session in localStorage
   */
  async setMockSession(session: object) {
    await this.page.evaluate((sessionData) => {
      localStorage.setItem('auth_session', JSON.stringify(sessionData));
    }, session);
  }

  /**
   * Screenshot the login page
   */
  async takeScreenshot(name: string = 'login-page') {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check accessibility - basic check
   */
  async checkAccessibility() {
    // Email should have label
    const emailId = await this.emailInput.getAttribute('id');
    if (emailId) {
      const emailLabel = this.page.locator(`label[for="${emailId}"]`);
      await expect(emailLabel).toBeVisible();
    }

    // Password should have label
    const passwordId = await this.passwordInput.getAttribute('id');
    if (passwordId) {
      const passwordLabel = this.page.locator(`label[for="${passwordId}"]`);
      await expect(passwordLabel).toBeVisible();
    }

    // Button should be keyboard accessible
    await expect(this.loginButton).toBeEnabled();
  }
}
