# Backend Tests

This directory contains test files for the BiliBay backend.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

- `models/` - Tests for Mongoose models
- `controllers/` - Tests for controller functions
- `routes/` - Integration tests for API routes
- `middlewares/` - Tests for middleware functions
- `setup.ts` - Test setup and teardown
- `app.ts` - Test Express app instance

## Test Database

Tests use a separate test database: `bilibay-test`

Make sure MongoDB is running before executing tests.

## Writing Tests

1. Use descriptive test names
2. Clean up test data in `beforeEach` or `afterEach`
3. Test both success and error cases
4. Use proper mocking for external dependencies

