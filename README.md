# API Test Automation: Restful-Booker

[![API Tests](https://github.com/Quinn-Palmer/api-test-portfolio/actions/workflows/api-tests.yml/badge.svg)](https://github.com/Quinn-Palmer/api-test-portfolio/actions/workflows/api-tests.yml)
[![Latest test report](https://img.shields.io/badge/report-latest%20run-2ea44f)](https://quinn-palmer.github.io/api-test-portfolio/)

An automated API test suite for the public [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html)
hotel-booking API, built with **Playwright Test** and **TypeScript**. It runs in **GitHub Actions** on every push
and once a day, and publishes an **HTML report** you can open in the browser.

**[View the latest test report →](https://quinn-palmer.github.io/api-test-portfolio/)**

## At a glance

| | |
|---|---|
| **Tests** | 44: functional, negative, auth, contract, data-driven, plus 11 known defects |
| **Stack** | Playwright Test (API mode), TypeScript, Zod for schema validation |
| **CI** | GitHub Actions: on push, on pull request, daily at 06:00 UTC, and on demand |
| **Reporting** | Playwright HTML report, published to GitHub Pages and saved as a build artifact |
| **Runtime** | About 3 seconds locally |

## What's tested and why

| Area | What it checks | Why it matters |
|---|---|---|
| **Booking lifecycle** | Create, read, list, search by name, full update, partial update, delete | Core user journey; every step checks the stored data, not just the status code |
| **Auth** | Token login, Basic auth, and update/patch/delete with no token, a bad token or wrong credentials | Writes must be protected; tests confirm the data is **unchanged** after a rejected request |
| **Negative** | Unknown or non-numeric IDs, malformed JSON, unsupported `Accept` header, empty search | The API should fail cleanly and predictably |
| **Contract** | Zod schemas for every response shape, with strict objects and ISO dates | Catches breaking changes, including unexpected new fields, before consumers do |
| **Data-driven** | 8 booking variations (zero price, year boundary, accented and non-Latin names...) from a JSON file | New cases can be added without changing code; each appears as its own test |
| **Known defects** | 11 real bugs, each asserting the *correct* behavior | Documents the bugs in a way that tells us when one gets fixed (see below) |

## Bugs found

Restful-Booker has intentional bugs for testers to find. These are the ones this suite documents:

| # | Defect | Expected | Actual |
|---|---|---|---|
| 1 | Wrong password on `POST /auth` | `401` | `200` with `{"reason":"Bad credentials"}` |
| 2–6 | Booking missing a required field (5 fields) | `400` | `500 Internal Server Error` |
| 7 | Checkout date before checkin date | `400` | Accepted and stored |
| 8 | Negative `totalprice` | `400` | Accepted and stored |
| 9 | Invalid date such as `"not-a-date"` | `400` | Stored as `"0NaN-aN-aN"` |
| 10 | Successful `DELETE` | `200` / `204` | `201 Created` |
| 11 | `DELETE` on a missing booking | `404` | `405 Method Not Allowed` |

These tests are marked `test.fail()`. The suite stays green while a bug exists, each bug is listed in the report
with a note, and **if a bug is ever fixed the test starts passing and the build fails**, so the marker is
never forgotten.

## Run it locally

Requires Node.js 20 or newer. No browser download is needed.

```bash
git clone https://github.com/Quinn-Palmer/api-test-portfolio.git
cd api-test-portfolio
npm ci
npm test                 # full suite
npm run test:smoke       # smoke subset (@smoke tag)
npm run report           # open the HTML report
```

Run one area by tag: `npx playwright test --grep @contract` (also `@auth`, `@negative`, `@known-defect`).

## Design decisions

- **Every test creates its own data.** The API is shared with the whole internet and resets every 10 minutes,
  so no test relies on existing records. Unique names keep search results predictable.
- **Automatic cleanup.** A `createBooking` fixture deletes what each test created, even when the test fails.
- **The client doesn't assert.** `BookingClient` returns raw responses, so happy-path and negative tests share
  one client and each test decides what to check.
- **Health check first.** A Playwright project dependency pings the API before the suite runs. If the API is
  down you get one clear failure instead of 40 misleading ones.
- **Retries only in CI.** CI retries twice to absorb hiccups from the free public host. Locally there are no
  retries, so flaky behavior stays visible.
- **Assert the state, not just the status.** A rejected update is followed by a read to prove nothing changed.
- **Contract tests are strict.** An unexpected extra field fails the contract, because API consumers are
  affected by additions too.
- **Tests named by outcome.** Test titles say what should happen ("a booking cannot be deleted without a
  token"), so the report reads like a spec.

## Project structure

```
src/
  api/booking-client.ts     API wrapper plus token and Basic auth helpers
  schemas/booking.schema.ts Zod response contracts
  data/booking-factory.ts   Builds valid, unique bookings
  data/booking-cases.json   Data for data-driven and missing-field tests
  fixtures.ts               api, auth and createBooking (with cleanup) fixtures
tests/
  health.setup.ts           Runs first; checks the API is up
  booking-crud.spec.ts      Happy-path lifecycle
  auth.spec.ts              Authentication and authorization
  booking-negative.spec.ts  Invalid requests
  contract.spec.ts          Schema validation
  data-driven.spec.ts       Data-driven creation cases
  known-defects.spec.ts     Documented bugs (test.fail)
.github/workflows/          CI: test, upload report, publish to Pages
```

## About

Built by **Quinn Palmer**, QA / test engineer. My background is manual and automated testing of .NET web APIs:
test plans and test cases in Azure DevOps, Postman collections run in CI, and production smoke-test triage.
This project shows the same approach in a code-first framework.

Restful-Booker's admin credentials (`admin` / `password123`) are public demo values from its documentation.
They can be overridden with the `API_USERNAME` and `API_PASSWORD` environment variables.
