# Testing Guide

## Overview

This project uses **Playwright** for end-to-end (E2E) testing. Playwright provides reliable, fast, and cross-browser testing capabilities.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Install Browsers

```bash
pnpm exec playwright install
```

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Run with UI (recommended for development)
pnpm test:ui

# Run specific test file
pnpm test auth.spec.ts

# Run tests in headed mode (see browser)
pnpm test:headed
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests in headless mode |
| `pnpm test:ui` | Open Playwright UI mode for interactive testing |
| `pnpm test:headed` | Run tests in headed mode (visible browser) |
| `pnpm test:debug` | Debug tests with Playwright Inspector |
| `pnpm test:report` | View HTML test report |
| `pnpm test:codegen` | Generate test code by recording interactions |

## Test Files

### 📁 `tests/e2e/`

- **`auth.spec.ts`** - Authentication tests (sign up, login, forgot password, reset password)
- **`dashboard.spec.ts`** - Dashboard functionality tests (sidebar, navigation, responsive)
- **`example.spec.ts`** - Example tests showcasing helpers, mocking, visual testing

### 📁 `tests/e2e/helpers/`

- **`test-helpers.ts`** - Reusable helper functions for common test operations

### 📁 `tests/e2e/fixtures/`

- **`auth.ts`** - Custom fixtures (e.g., authenticated page)

## Test Coverage

### ✅ Authentication Flow
- Sign up validation and success
- Login with valid/invalid credentials  
- Forgot password flow
- Reset password with valid/invalid token
- Form validation errors
- Accessibility compliance

### ✅ Dashboard
- Layout rendering (sidebar, main content, user profile)
- Sidebar toggle (mobile and desktop)
- Sidebar state persistence
- Navigation menu
- Responsive design (mobile, tablet, desktop)
- Keyboard navigation
- Accessibility (ARIA labels, headings, screen readers)

### ✅ Examples
- Helper functions usage
- API mocking
- Visual regression testing
- Performance testing (load time, Core Web Vitals)

## Writing Tests

### Basic Example

```typescript
import { test, expect } from '@playwright/test';

test('should display login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});
```

### Using Helpers

```typescript
import { test, expect } from '@playwright/test';
import { login, fillForm } from './helpers/test-helpers';

test('should login successfully', async ({ page }) => {
  await login(page, 'admin@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

### Using Fixtures

```typescript
import { test, expect } from './fixtures/auth';

test('use authenticated page', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

### API Mocking

```typescript
test('should mock API response', async ({ page }) => {
  await page.route('**/api/endpoint', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
  
  // Now interact with the page
  await page.goto('/some-page');
});
```

## Best Practices

1. **Use Playwright's auto-waiting** - Don't add manual waits
2. **Test user flows, not implementation** - Focus on what users do
3. **Keep tests independent** - Each test should run in isolation
4. **Use descriptive names** - Test names should explain what they test
5. **Mock external APIs** - Avoid flaky tests from network issues
6. **Use Page Object Model** - For complex pages, create page objects
7. **Cleanup after tests** - Use `beforeEach`/`afterEach` hooks

## Debugging

### UI Mode (Recommended)

```bash
pnpm test:ui
```

Features:
- ⏯️ Watch mode with hot reload
- 🎬 Time travel debugging
- 🎯 Pick locators visually
- 📊 See test traces
- 🔍 Inspect DOM snapshots

### Debug Mode

```bash
pnpm test:debug
```

Opens Playwright Inspector for step-by-step debugging.

### VS Code Extension

Install the [Playwright VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) for:
- Run tests from editor
- Set breakpoints
- Live debugging

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Failing Due to Timeouts

Increase timeout in `playwright.config.ts`:

```typescript
timeout: 60 * 1000, // 60 seconds
```

### Browser Not Installing

```bash
# Install system dependencies (Linux)
pnpm exec playwright install-deps

# Install specific browser
pnpm exec playwright install chromium
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Flaky Tests

- Avoid hardcoded `page.waitForTimeout()`
- Use Playwright's built-in auto-waiting
- Mock external API calls
- Ensure tests don't depend on each other

## Resources

- 📚 [Playwright Documentation](https://playwright.dev/)
- 🎓 [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- 💡 [Best Practices](https://playwright.dev/docs/best-practices)
- 🎯 [Locators Guide](https://playwright.dev/docs/locators)
- 🔍 [Debugging Guide](https://playwright.dev/docs/debug)

## Test Statistics

Run `pnpm test` to see test statistics:

```
Total tests: 42+ tests
Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
Test files: 3 (auth, dashboard, example)
Coverage: Authentication, Dashboard, Accessibility, Performance
```

## Contributing

When adding new tests:

1. ✅ Follow existing patterns
2. ✅ Use descriptive test names
3. ✅ Add comments for complex logic
4. ✅ Use helper functions when appropriate
5. ✅ Ensure tests pass in CI
6. ✅ Update documentation if needed

---

**Happy Testing! 🎭**
