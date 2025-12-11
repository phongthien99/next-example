# E2E Testing with Playwright

This directory contains end-to-end tests for the Next.js application using [Playwright](https://playwright.dev/).

## 📁 Structure

```
tests/
├── e2e/
│   ├── auth.spec.ts          # Authentication flow tests
│   ├── dashboard.spec.ts     # Dashboard functionality tests
│   ├── example.spec.ts       # Example tests with helpers
│   ├── fixtures/
│   │   └── auth.ts           # Custom fixtures (authenticated page)
│   └── helpers/
│       └── test-helpers.ts   # Reusable test helper functions
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed Playwright browsers:

```bash
pnpm exec playwright install
```

### Running Tests

```bash
# Run all tests in headless mode
pnpm test

# Run tests with UI mode (recommended for debugging)
pnpm test:ui

# Run tests in headed mode (see browser)
pnpm test:headed

# Run specific test file
pnpm test auth.spec.ts

# Run tests matching a pattern
pnpm test --grep "login"

# Debug tests
pnpm test:debug

# View test report
pnpm test:report
```

## 📝 Test Files

### `auth.spec.ts`
Tests for authentication flows:
- Sign up validation and success
- Login with valid/invalid credentials
- Forgot password flow
- Reset password flow
- Accessibility checks for auth pages

### `dashboard.spec.ts`
Tests for dashboard functionality:
- Layout and sidebar rendering
- Sidebar toggle (mobile and desktop)
- Responsive design across viewports
- Keyboard navigation
- Accessibility compliance

### `example.spec.ts`
Example tests demonstrating:
- Using helper functions
- API mocking
- Visual regression testing
- Performance testing
- Custom fixtures

## 🛠️ Helper Functions

Located in `helpers/test-helpers.ts`:

```typescript
// Authentication helpers
await login(page, 'email@example.com', 'password');
await signup(page, 'email@example.com', 'password');
await logout(page);

// Form helpers
await fillForm(page, { 'email': 'test@example.com', 'password': 'pass123' });

// Navigation helpers
await waitForNavigation(page);
await clickAndWaitForNavigation(page, 'button');

// Storage helpers
await clearLocalStorage(page);
await setLocalStorageItem(page, 'key', 'value');
const value = await getLocalStorageItem(page, 'key');

// API helpers
await mockApiResponse(page, '/api/endpoint', { data: 'mocked' });
await waitForApiResponse(page, '/api/endpoint');

// Utility helpers
await takeScreenshot(page, 'screenshot-name');
await checkBasicAccessibility(page);
```

## 🎯 Custom Fixtures

Located in `fixtures/auth.ts`:

```typescript
import { test, expect } from './fixtures/auth';

test('use authenticated page', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

## 📊 Test Configuration

Configuration is in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000` (configurable via env)
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML, List, JUnit
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## 🎨 Visual Testing

Example of visual regression testing:

```typescript
await expect(page).toHaveScreenshot('login-page.png', {
  maxDiffPixels: 100,
});
```

First run creates baseline, subsequent runs compare against it.

## 🔍 Debugging Tests

### Using UI Mode (Recommended)
```bash
pnpm test:ui
```

Features:
- Watch mode
- Time travel debugging
- Pick locators
- See test traces

### Using Debug Mode
```bash
pnpm test:debug
```

Opens Playwright Inspector for step-by-step debugging.

### Using Codegen
```bash
pnpm test:codegen
```

Record browser interactions to generate test code.

## 🌐 Running Against Different Environments

```bash
# Development
pnpm test

# Staging
PLAYWRIGHT_TEST_BASE_URL=https://staging.example.com pnpm test

# Production
PLAYWRIGHT_TEST_BASE_URL=https://example.com pnpm test
```

## 📈 CI/CD Integration

Example GitHub Actions workflow:

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
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run tests
        run: pnpm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Best Practices

1. **Use Page Object Model** for complex pages
2. **Use data-testid** for stable selectors
3. **Avoid hardcoded waits** - use Playwright's auto-waiting
4. **Mock external APIs** to avoid flaky tests
5. **Test user flows**, not implementation details
6. **Keep tests independent** - each test should be able to run in isolation
7. **Use descriptive test names** - describe what the test does
8. **Group related tests** using `test.describe()`
9. **Clean up state** - use `beforeEach` and `afterEach` hooks

## 🐛 Common Issues

### Browser Installation Issues
```bash
# Install system dependencies (Linux)
pnpm exec playwright install-deps

# Install specific browser
pnpm exec playwright install chromium
```

### Port Already in Use
Make sure no other process is using port 3000:
```bash
lsof -i :3000
kill -9 <PID>
```

### Flaky Tests
- Use Playwright's auto-waiting
- Avoid hardcoded timeouts
- Mock external dependencies
- Ensure tests are independent

## 📖 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns and structure
2. Add descriptive test names
3. Use helper functions when possible
4. Add comments for complex logic
5. Ensure tests pass in CI
6. Update this README if needed
