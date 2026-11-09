/**
 * Restful-Booker's admin credentials are published in its public docs and are
 * the same for every user of the demo API, so they are safe to commit.
 * They can still be overridden through environment variables.
 */
export const credentials = {
  username: process.env.API_USERNAME ?? 'admin',
  password: process.env.API_PASSWORD ?? 'password123',
};
