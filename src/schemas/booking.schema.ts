import { z } from 'zod';

/**
 * Response contracts for Restful-Booker, based on the public API docs:
 * https://restful-booker.herokuapp.com/apidoc/index.html
 *
 * Objects are strict: an unexpected extra field fails the contract, because
 * consumers of an API are affected by additions as well as removals.
 */

const isoDate = z.iso.date(); // YYYY-MM-DD

export const BookingDatesSchema = z.strictObject({
  checkin: isoDate,
  checkout: isoDate,
});

export const BookingSchema = z.strictObject({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number().int(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(
  z.strictObject({ bookingid: z.number().int().positive() }),
);

export const AuthTokenSchema = z.strictObject({
  token: z.string().regex(/^[a-f0-9]+$/),
});

export type Booking = z.infer<typeof BookingSchema>;
