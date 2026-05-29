import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Roles permitted to access the admin area and admin APIs.
 */
const PRIVILEGED_ROLES = new Set(["ADMIN", "MODERATOR"]);

/**
 * Auth.js v5 uses a `secret` for signing the session JWT. We read it from the
 * standard env names so middleware works in both dev and prod.
 */
const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

/**
 * Applies baseline security headers to every response.
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  return response;
}

/**
 * Reads the decoded session token (JWT strategy). Returns `null` when the
 * request is unauthenticated or the token cannot be verified.
 */
async function getSessionToken(request: NextRequest) {
  // `secureCookie` must match the deployment scheme so the correct cookie
  // name (`__Secure-authjs.session-token` vs `authjs.session-token`) is read.
  const secureCookie =
    request.nextUrl.protocol === "https:" ||
    process.env.NODE_ENV === "production";

  return getToken({
    req: request,
    secret: AUTH_SECRET,
    secureCookie,
  });
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ─── Admin API: respond with JSON 401/403, never a redirect ──────────────
  if (pathname.startsWith("/api/admin")) {
    const token = await getSessionToken(request);

    if (!token) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
          { status: 401 }
        )
      );
    }

    if (!PRIVILEGED_ROLES.has(String(token.role))) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions." } },
          { status: 403 }
        )
      );
    }

    return withSecurityHeaders(NextResponse.next());
  }

  // ─── Admin pages: redirect unauthorized users ────────────────────────────
  if (pathname.startsWith("/admin")) {
    const token = await getSessionToken(request);

    if (!token) {
      // Send to login and remember where the user was heading.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (!PRIVILEGED_ROLES.has(String(token.role))) {
      // Authenticated but not allowed — send home.
      return withSecurityHeaders(
        NextResponse.redirect(new URL("/", request.url))
      );
    }

    return withSecurityHeaders(NextResponse.next());
  }

  // ─── All other routes: just attach security headers ──────────────────────
  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  /**
   * Run on every path except Next internals and static assets. The negative
   * lookahead excludes `_next/static`, `_next/image`, the favicon and any file
   * with an extension (images, fonts, etc.).
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)",
  ],
};
