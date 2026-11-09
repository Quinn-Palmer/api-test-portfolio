import { test, expect } from '../src/fixtures';
import { basicAuth, tokenAuth } from '../src/api/booking-client';
import { buildBooking } from '../src/data/booking-factory';
import { credentials } from '../src/config';

test.describe('Authentication and authorization', { tag: '@auth' }, () => {
  test('valid credentials return a token', { tag: '@smoke' }, async ({ api }) => {
    const res = await api.createToken(credentials.username, credentials.password);
    expect(res.status()).toBe(200);
    expect((await res.json()).token).toBeTruthy();
  });

  test('wrong password does not return a token', async ({ api }) => {
    const res = await api.createToken(credentials.username, 'not-the-password');
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
    // The status code here is wrong (200); see known-defects.spec.ts.
  });

  test('a booking cannot be updated without a token', async ({ api, createBooking }) => {
    const original = buildBooking();
    const id = await createBooking(original);

    const res = await api.update(id, buildBooking({ firstname: 'Intruder' }));
    expect(res.status()).toBe(403);
    // The booking must be unchanged, not just the status code.
    expect(await (await api.get(id)).json()).toEqual(original);
  });

  test('a booking cannot be updated with an invalid token', async ({ api, createBooking }) => {
    const id = await createBooking(buildBooking());

    const res = await api.update(id, buildBooking(), tokenAuth('invalid-token'));
    expect(res.status()).toBe(403);
  });

  test('a booking cannot be partially updated without a token', async ({ api, createBooking }) => {
    const original = buildBooking();
    const id = await createBooking(original);

    const res = await api.partialUpdate(id, { firstname: 'Intruder' });
    expect(res.status()).toBe(403);
    expect(await (await api.get(id)).json()).toEqual(original);
  });

  test('a booking cannot be deleted without a token', async ({ api, createBooking }) => {
    const id = await createBooking(buildBooking());

    const res = await api.delete(id);
    expect(res.status()).toBe(403);
    expect((await api.get(id)).status()).toBe(200);
  });

  test('Basic auth with admin credentials can update a booking', async ({ api, createBooking }) => {
    const id = await createBooking(buildBooking());
    const updated = buildBooking({ firstname: 'Basic' });

    const res = await api.update(id, updated, basicAuth(credentials.username, credentials.password));
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  test('Basic auth with wrong credentials is rejected', async ({ api, createBooking }) => {
    const id = await createBooking(buildBooking());

    const res = await api.update(id, buildBooking(), basicAuth(credentials.username, 'wrong'));
    expect(res.status()).toBe(403);
  });
});
