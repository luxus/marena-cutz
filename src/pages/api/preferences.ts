import type { APIRoute } from 'astro';
import { VALID_THEMES, VALID_MODES } from '../../lib/themes';

export const prerender = false; // Must be dynamic: uses Astro.session (backed by Cloudflare SESSION KV)

type Theme = (typeof VALID_THEMES)[number];
type Mode = (typeof VALID_MODES)[number];

interface Preferences {
  theme: Theme;
  mode: Mode;
}

/**
 * POST /api/preferences
 * Body: { theme: string, mode: string }
 * - Strict allowlist validation
 * - Persists to Astro.session (Cloudflare KV durable storage)
 * - Emits readable cookies (theme, mode) that the early bootstrap <script> in BaseLayout parses via document.cookie
 *   These cookies survive localStorage.clear() and are the highest non-URL source for the inline bootstrap.
 * - Fire-and-forget safe from ThemeSwitcher
 */
export const POST: APIRoute = async ({ request, session, cookies }) => {
  try {
    const body = await request.json();
    const theme = body?.theme as Theme;
    const mode = body?.mode as Mode;

    // Strict validation against the canonical allowlists
    if (!VALID_THEMES.includes(theme) || !VALID_MODES.includes(mode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid theme or mode', validThemes: VALID_THEMES, validModes: VALID_MODES }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prefs: Preferences = { theme, mode };

    // 1. Write to server session (durable KV via Cloudflare adapter SESSION binding)
    // Use optional chaining + non-null assertion for the session provided by the adapter in dynamic routes
    if (session) {
      await session.set('preferences', prefs);
      await session.set('theme', theme);
      await session.set('mode', mode);
    }

    // 2. Emit *readable* cookies for the early bootstrap script (document.cookie parser)
    // These must NOT be HttpOnly. Long expiry (1 year) matches the session ttl in astro.config.
    // SameSite=Lax is safe for top-level navigation + the POSTs from same origin.
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax' as const,
      // secure: true in production (adapter + CF handles HTTPS); omit for local dev flexibility
    };

    cookies.set('theme', theme, cookieOptions);
    cookies.set('mode', mode, cookieOptions);

    return new Response(JSON.stringify({ success: true, theme, mode }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Bad request', details: String(err) }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Optional GET /api/preferences
 * Returns the current persisted preferences (from session if present, otherwise falls back gracefully).
 * Useful for debugging or future hydration of the ThemeSwitcher on full SSR pages.
 */
export const GET: APIRoute = async ({ session, cookies }) => {
  try {
    // Prefer session (durable source of truth)
    let fromSession: Preferences | undefined;
    if (session) {
      fromSession = (await session.get('preferences')) as Preferences | undefined;
    }
    if (fromSession && VALID_THEMES.includes(fromSession.theme) && VALID_MODES.includes(fromSession.mode)) {
      return new Response(JSON.stringify({ success: true, ...fromSession, source: 'session' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fallback to the readable cookies the bootstrap also uses
    const theme = cookies.get('theme')?.value as Theme | undefined;
    const mode = cookies.get('mode')?.value as Mode | undefined;

    if (theme && mode && VALID_THEMES.includes(theme) && VALID_MODES.includes(mode)) {
      return new Response(JSON.stringify({ success: true, theme, mode, source: 'cookie' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'No preferences stored yet' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
