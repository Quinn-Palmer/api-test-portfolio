import { test, expect } from '../src/fixtures';
import { buildBooking } from '../src/data/booking-factory';
import { credentials } from '../src/config';
import cases from '../src/data/booking-cases.json';

/**
 * Restful-Booker ships with intentional bugs for testers to find.
 *
 * Each test below asserts the CORRECT behavior and is marked `test.fail()`, so:
 *   - today, the suite stays green and the report lists each defect;
 *   - if a defect is ever fixed, the test unexpectedly passes and Playwright
 *     fails the run, prompting us to remove the marker.
 *
 * Each defect has an annotation that shows up in the HTML report.
 */
const defect = (description: string) => ({
  tag: '@known-defect',
  annotation: { type: 'defect', description },
});

test.describe('Known defects', () => {
  test(
    'wrong credentials return 401 Unauthorized',
    defect('POST /auth with a wrong password returns 200 OK with {"reason":"Bad credentials"}.'),
    async ({ api }) => {
      test.fail();
      const res = await api.createToken(credentials.username, 'wrong');
      expect(res.status()).toBe(401);
    },
  );

  for (const field of cases.missingRequiredField) {
    test(
      `a booking missing "${field}" is rejected with 400`,
      defect(`POST /booking without "${field}" returns 500 Internal Server Error instead of 400.`),
      async ({ api, auth }) => {
        test.fail();
        const payload: Record<string, unknown> = buildBooking();
        delete payload[field];
        const res = await api.create(payload);
        if (res.ok()) await api.delete((await res.json()).bookingid, auth);
        expect(res.status()).toBe(400);
      },
    );
  }

  test(
    'a checkout date before the checkin date is rejected',
    defect('POST /booking accepts checkout earlier than checkin and stores it.'),
    async ({ api, auth }) => {
      test.fail();
      const res = await api.create(
        buildBooking({ bookingdates: { checkin: '2027-01-10', checkout: '2027-01-01' } }),
      );
      if (res.ok()) await api.delete((await res.json()).bookingid, auth);
      expect(res.status()).toBe(400);
    },
  );

  test(
    'a negative total price is rejected',
    defect('POST /booking accepts a negative totalprice.'),
    async ({ api, auth }) => {
      test.fail();
      const res = await api.create(buildBooking({ totalprice: -50 }));
      if (res.ok()) await api.delete((await res.json()).bookingid, auth);
      expect(res.status()).toBe(400);
    },
  );

  test(
    'an invalid date is rejected',
    defect('POST /booking accepts checkin "not-a-date" and stores it as "0NaN-aN-aN".'),
    async ({ api, auth }) => {
      test.fail();
      const res = await api.create(
        buildBooking({ bookingdates: { checkin: 'not-a-date', checkout: '2027-01-05' } }),
      );
      if (res.ok()) await api.delete((await res.json()).bookingid, auth);
      expect(res.status()).toBe(400);
    },
  );

  test(
    'a successful delete returns 200 or 204',
    defect('DELETE /booking/:id returns 201 Created, which means a resource was created.'),
    async ({ api, auth, createBooking }) => {
      test.fail();
      const id = await createBooking(buildBooking());
      const res = await api.delete(id, auth);
      expect([200, 204]).toContain(res.status());
    },
  );

  test(
    'deleting a booking that does not exist returns 404',
    defect('DELETE on a missing booking returns 405 Method Not Allowed instead of 404.'),
    async ({ api, auth }) => {
      test.fail();
      const res = await api.delete(999_999_999, auth);
      expect(res.status()).toBe(404);
    },
  );
});
