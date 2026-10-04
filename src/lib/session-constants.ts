// Edge-safe (no Node imports) so middleware and server code share one definition.
const isProd = process.env.NODE_ENV === "production";
/** "__Host-" prefix (production) forces Secure + Path=/ + no Domain, blocking cookie-injection from subdomains. */
export const SESSION_COOKIE_NAME = isProd ? "__Host-rf_admin_session" : "rf_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
