import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from '../schemas/booking.schema';

/**
 * Thin wrapper over the Restful-Booker endpoints.
 *
 * Methods return the raw APIResponse rather than parsed bodies, so each test
 * decides what to assert (status, headers, body). Keeping assertions out of the
 * client means negative tests can use the same client as happy-path tests.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  createToken(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  list(filters: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: filters });
  }

  get(id: number | string, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`, { headers });
  }

  /** `data` is loosely typed on purpose: negative tests send invalid payloads. */
  create(data: unknown): Promise<APIResponse> {
    return this.request.post('/booking', { data });
  }

  /** Sends a raw string body, for malformed-JSON tests. */
  createRaw(body: string): Promise<APIResponse> {
    return this.request.post('/booking', { data: body });
  }

  update(id: number, data: Booking, auth: AuthHeaders = {}): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data, headers: auth });
  }

  partialUpdate(id: number, data: Partial<Booking>, auth: AuthHeaders = {}): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data, headers: auth });
  }

  delete(id: number, auth: AuthHeaders = {}): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: auth });
  }
}

export type AuthHeaders = Record<string, string>;

/** The API accepts a token as a cookie... */
export const tokenAuth = (token: string): AuthHeaders => ({ Cookie: `token=${token}` });

/** ...or HTTP Basic auth with the admin credentials. */
export const basicAuth = (username: string, password: string): AuthHeaders => ({
  Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
});
