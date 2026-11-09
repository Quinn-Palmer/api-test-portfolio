import { test, expect } from '../src/fixtures';
import { buildBooking } from '../src/data/booking-factory';

test.describe('Invalid requests', { tag: '@negative' }, () => {
  test('requesting a booking that does not exist returns 404', async ({ api }) => {
    const res = await api.get(999_999_999);
    expect(res.status()).toBe(404);
  });

  test('requesting a booking with a non-numeric id returns 404', async ({ api }) => {
    const res = await api.get('not-a-number');
    expect(res.status()).toBe(404);
  });

  test('malformed JSON is rejected with 400', async ({ api }) => {
    const res = await api.createRaw('{ "firstname": "Ada", ');
    expect(res.status()).toBe(400);
  });

  test('an unsupported Accept header is rejected', async ({ api, createBooking }) => {
    const id = await createBooking(buildBooking());
    // Restful-Booker answers unsupported media types with 418 (documented).
    // The important part is that it refuses rather than returning a body.
    const res = await api.get(id, { Accept: 'text/plain' });
    expect(res.status()).toBe(418);
  });

  test('searching for a name with no bookings returns an empty list', async ({ api }) => {
    const res = await api.list({ firstname: 'Nobody', lastname: 'Matches-0f3c9a' });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
