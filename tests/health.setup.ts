import { test, expect } from '../src/fixtures';

test('API is up and responding', { tag: '@smoke' }, async ({ api }) => {
  const res = await api.ping();
  // Restful-Booker answers its health check with 201 Created (documented behavior).
  expect(res.status()).toBe(201);
});
