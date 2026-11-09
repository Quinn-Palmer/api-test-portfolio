import type { z } from 'zod';
import { test, expect } from '../src/fixtures';
import { buildBooking } from '../src/data/booking-factory';
import { credentials } from '../src/config';
import {
  AuthTokenSchema,
  BookingIdListSchema,
  BookingSchema,
  CreateBookingResponseSchema,
} from '../src/schemas/booking.schema';

/** Asserts a body matches a schema, with a readable list of violations on failure. */
function expectToMatch(schema: z.ZodType, body: unknown) {
  const result = schema.safeParse(body);
  const problems = result.success
    ? []
    : result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
  expect(problems, 'contract violations').toEqual([]);
}

test.describe('Response contracts', { tag: '@contract' }, () => {
  test('POST /auth matches the token contract', async ({ api }) => {
    const res = await api.createToken(credentials.username, credentials.password);
    expectToMatch(AuthTokenSchema, await res.json());
  });

  test('POST /booking matches the create-booking contract', async ({ api, auth }) => {
    const res = await api.create(buildBooking());
    expect(res.headers()['content-type']).toContain('application/json');
    const body = await res.json();
    expectToMatch(CreateBookingResponseSchema, body);
    await api.delete(body.bookingid, auth);
  });

  test('GET /booking/:id matches the booking contract', async ({ api, createBooking }) => {
    const id = await createBooking(buildBooking());
    const res = await api.get(id);
    expect(res.headers()['content-type']).toContain('application/json');
    expectToMatch(BookingSchema, await res.json());
  });

  test('GET /booking matches the booking-id list contract', async ({ api }) => {
    const res = await api.list();
    expectToMatch(BookingIdListSchema, await res.json());
  });

  test('additionalneeds is optional in the contract', async ({ api, createBooking }) => {
    const { additionalneeds: _omitted, ...withoutNeeds } = buildBooking();
    const id = await createBooking(withoutNeeds);
    expectToMatch(BookingSchema, await (await api.get(id)).json());
  });
});
