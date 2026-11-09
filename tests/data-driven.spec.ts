import { test, expect } from '../src/fixtures';
import { buildBooking } from '../src/data/booking-factory';
import type { Booking } from '../src/schemas/booking.schema';
import cases from '../src/data/booking-cases.json';

/**
 * Test data lives in booking-cases.json, so new cases can be added without
 * touching test code. Each entry becomes its own named test in the report.
 */
test.describe('Data-driven booking creation', () => {
  for (const { case: name, overrides } of cases.valid) {
    test(`booking is stored correctly: ${name}`, async ({ api, createBooking }) => {
      // Last name stays unique; the case only overrides the fields it is about.
      const booking = buildBooking(overrides as Partial<Booking>);
      const id = await createBooking(booking);

      const res = await api.get(id);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(booking);
    });
  }
});
