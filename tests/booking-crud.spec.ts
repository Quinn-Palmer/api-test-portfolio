import { test, expect } from '../src/fixtures';
import { buildBooking } from '../src/data/booking-factory';

test.describe('Booking lifecycle (happy path)', () => {
  test('a created booking can be retrieved with the same details', { tag: '@smoke' }, async ({ api, auth }) => {
    const booking = buildBooking();

    // Calls create directly (not the createBooking fixture) to assert on the raw response.
    const createRes = await api.create(booking);
    expect(createRes.status()).toBe(200);
    const { bookingid, booking: echoed } = await createRes.json();
    expect(echoed).toEqual(booking);

    const getRes = await api.get(bookingid);
    expect(getRes.status()).toBe(200);
    expect(await getRes.json()).toEqual(booking);

    await api.delete(bookingid, auth);
  });

  test('a new booking appears in the booking list', async ({ api, createBooking }) => {
    const id = await createBooking(buildBooking());

    const res = await api.list();
    expect(res.status()).toBe(200);
    expect(await res.json()).toContainEqual({ bookingid: id });
  });

  test('bookings can be found by first and last name', async ({ api, createBooking }) => {
    const booking = buildBooking();
    const id = await createBooking(booking);

    const res = await api.list({ firstname: booking.firstname, lastname: booking.lastname });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([{ bookingid: id }]);
  });

  test('a booking can be fully updated by an authenticated user', { tag: '@smoke' }, async ({ api, auth, createBooking }) => {
    const id = await createBooking(buildBooking());
    const updated = buildBooking({
      firstname: 'Grace',
      totalprice: 480,
      depositpaid: false,
      bookingdates: { checkin: '2027-06-10', checkout: '2027-06-15' },
      additionalneeds: 'Late checkout',
    });

    const res = await api.update(id, updated, auth);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(await (await api.get(id)).json()).toEqual(updated);
  });

  test('a partial update changes only the fields sent', async ({ api, auth, createBooking }) => {
    const original = buildBooking();
    const id = await createBooking(original);

    const res = await api.partialUpdate(id, { firstname: 'Katherine', totalprice: 99 }, auth);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ...original, firstname: 'Katherine', totalprice: 99 });
  });

  test('a deleted booking can no longer be retrieved', { tag: '@smoke' }, async ({ api, auth, createBooking }) => {
    const id = await createBooking(buildBooking());

    const deleteRes = await api.delete(id, auth);
    // 201 is wrong for a delete, but it is the API's documented response.
    // See known-defects.spec.ts for the test that flags it.
    expect(deleteRes.ok()).toBe(true);

    expect((await api.get(id)).status()).toBe(404);
  });
});
