import { test as base, expect } from '@playwright/test';
import { BookingClient, tokenAuth, type AuthHeaders } from './api/booking-client';
import { AuthTokenSchema, type Booking } from './schemas/booking.schema';
import { credentials } from './config';

type Fixtures = {
  /** API client bound to this test's request context. */
  api: BookingClient;
  /** Auth headers carrying a fresh token. */
  auth: AuthHeaders;
  /**
   * Creates a booking, asserts it succeeded, and deletes it after the test.
   * Returns the new booking's id.
   */
  createBooking: (booking: Booking) => Promise<number>;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  auth: async ({ api }, use) => {
    const res = await api.createToken(credentials.username, credentials.password);
    expect(res.status()).toBe(200);
    const { token } = AuthTokenSchema.parse(await res.json());
    await use(tokenAuth(token));
  },

  createBooking: async ({ api, auth }, use) => {
    const created: number[] = [];

    await use(async (booking) => {
      const res = await api.create(booking);
      expect(res.status(), 'create booking').toBe(200);
      const { bookingid } = await res.json();
      created.push(bookingid);
      return bookingid;
    });

    // Teardown: leave the shared API as we found it. Tests may already have
    // deleted their booking, so a 405 ("already gone") is fine here.
    for (const id of created) {
      await api.delete(id, auth);
    }
  },
});

export { expect };
