import { randomUUID } from 'node:crypto';
import type { Booking } from '../schemas/booking.schema';

/**
 * Builds a valid booking with a unique last name.
 *
 * The API is shared with everyone on the internet, so tests never rely on
 * pre-existing data: each test creates what it needs, and the unique name lets
 * search tests find exactly their own records.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Ada',
    lastname: `Tester-${randomUUID().slice(0, 8)}`,
    totalprice: 250,
    depositpaid: true,
    bookingdates: { checkin: '2027-03-01', checkout: '2027-03-04' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
