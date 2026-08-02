import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

// 只保護「會修改資料」的 API：讀取用的 GET 端點玩家頁面也需要用到，維持公開
const PROTECTED_API_ROUTES: { pattern: RegExp; methods: string[] }[] = [
  { pattern: /^\/api\/bets$/, methods: ["POST"] },
  { pattern: /^\/api\/bets\/[^/]+$/, methods: ["PATCH", "DELETE"] },
  { pattern: /^\/api\/settings$/, methods: ["PATCH"] },
  { pattern: /^\/api\/draws\/[^/]+\/execute$/, methods: ["POST"] },
  { pattern: /^\/api\/draws\/[^/]+\/bets$/, methods: ["DELETE"] },
];

function isAuthed(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return !!token && !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = isAuthed(request);

  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname)) {
    if (!authed) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const matchedApi = PROTECTED_API_ROUTES.find(
    (r) => r.pattern.test(pathname) && r.methods.includes(request.method)
  );
  if (matchedApi && !authed) {
    return NextResponse.json({ error: "未登入，請先到 /admin/login 登入管理後台" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/bets", "/api/bets/:path*", "/api/settings", "/api/draws/:path*"],
};
