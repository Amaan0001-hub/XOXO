// import { NextResponse } from "next/server";

// const USER_LOGIN_PATH = "/user/login";
// const ADMIN_LOGIN_PATH = "/xoxo-adminlogin";

// const SESSION_TIMEOUT = 15 * 60 * 1000; // 1 minute

// export function middleware(request) {
//   const { pathname } = request.nextUrl;

//   // Allow login pages
//   if (
//     pathname === USER_LOGIN_PATH ||
//     pathname === ADMIN_LOGIN_PATH
//   ) {
//     return NextResponse.next();
//   }

//   // Protected routes
//   const isDashboardRoute =
//     pathname === "/user/dashboard" ||
//     pathname.startsWith("/user/dashboard/");

//   const isAdminRoute =
//     pathname === "/admin" ||
//     pathname.startsWith("/admin/");

//   const isProtectedRoute =
//     isDashboardRoute || isAdminRoute;

//   if (!isProtectedRoute) {
//     return NextResponse.next();
//   }

//   // Cookies
//   const tokenCookie = request.cookies.get("token")?.value;
//   const lastActivity = request.cookies.get("lastActivity")?.value;
//   const userTypeCookie = request.cookies.get("userType")?.value;

//   // Decide login page
//   const loginPath = isAdminRoute
//     ? ADMIN_LOGIN_PATH
//     : USER_LOGIN_PATH;

//   // No token
//   if (!tokenCookie) {
//     const url = request.nextUrl.clone();

//     url.pathname = loginPath;
//     url.searchParams.set("from", pathname);
//     url.searchParams.set("refresh", Date.now().toString());

//     const response = NextResponse.redirect(url);

//     response.headers.set(
//       "Cache-Control",
//       "no-store, no-cache, must-revalidate, private"
//     );

//     return response;
//   }

//   // Session timeout
//   if (
//     lastActivity &&
//     Date.now() > Number(lastActivity) + SESSION_TIMEOUT
//   ) {
//     const url = request.nextUrl.clone();

//     url.pathname = loginPath;
//     url.searchParams.set("from", pathname);
//     url.searchParams.set("refresh", Date.now().toString());

//     const response = NextResponse.redirect(url);

//     response.cookies.delete("token");
//     response.cookies.delete("lastActivity");
//     response.cookies.delete("userType");

//     response.headers.set(
//       "Cache-Control",
//       "no-store, no-cache, must-revalidate, private"
//     );

//     return response;
//   }

//   // Example:
//   // userType=2 => Admin
//   if (
//     String(userTypeCookie) === "2" &&
//     isDashboardRoute
//   ) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/admin";

//     return NextResponse.redirect(url);
//   }

//   const response = NextResponse.next();

//   response.headers.set(
//     "Cache-Control",
//     "no-store, no-cache, must-revalidate, private"
//   );

//   return response;
// }

// export const config = {
//   matcher: [
//     "/user/dashboard/:path*",
//     "/admin/:path*",
//   ],
// };




import { NextResponse } from "next/server";

const USER_LOGIN_PATH = "/user/login";
const ADMIN_LOGIN_PATH = "/ad-crm";

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes - auto logout after inactivity

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login pages
  if (
    pathname === USER_LOGIN_PATH ||
    pathname === ADMIN_LOGIN_PATH
  ) {
    return NextResponse.next();
  }

  // Protected routes
  const isDashboardRoute =
    pathname === "/user/dashboard" ||
    pathname.startsWith("/user/dashboard/");

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isProtectedRoute =
    isDashboardRoute || isAdminRoute;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Cookies
  const tokenCookie = request.cookies.get("token")?.value;
  const adminTokenCookie = request.cookies.get("admintoken")?.value;
  const lastActivity = request.cookies.get("lastActivity")?.value;
  const userTypeCookie = request.cookies.get("userType")?.value;
  const roleCookie = request.cookies.get("Role")?.value;
  

  // Decide login page
  const loginPath = isAdminRoute
    ? ADMIN_LOGIN_PATH
    : USER_LOGIN_PATH;

 const requiredToken =
  roleCookie === "Admin"
    ? adminTokenCookie
    : tokenCookie;
  // No token
  // if (!tokenCookie) {
  //   const url = request.nextUrl.clone();

  //   url.pathname = loginPath;
  //   url.searchParams.set("from", pathname);
  //   url.searchParams.set("refresh", Date.now().toString());

  //   const response = NextResponse.redirect(url);

  //   response.headers.set(
  //     "Cache-Control",
  //     "no-store, no-cache, must-revalidate, private"
  //   );

  //   return response;
  // }
  // No required token
  if (!requiredToken) {
    const url = request.nextUrl.clone();

    url.pathname = loginPath;
    url.searchParams.set("from", pathname);
    url.searchParams.set("refresh", Date.now().toString());

    const response = NextResponse.redirect(url);

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    return response;
  }
  // Session timeout
  if (
    lastActivity &&
    Date.now() > Number(lastActivity) + SESSION_TIMEOUT
  ) {
    const url = request.nextUrl.clone();

    url.pathname = loginPath;
    url.searchParams.set("from", pathname);
    url.searchParams.set("refresh", Date.now().toString());

    const response = NextResponse.redirect(url);

    // Clear user-specific cookies
    response.cookies.delete("token");
    response.cookies.delete("lastActivity");
    response.cookies.delete("userType");

    // Clear admin-specific cookies
    response.cookies.delete("admintoken");
    response.cookies.delete("Role");

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    return response;
  }

  // Example:
  // userType=2 => Admin
  if (
    String(userTypeCookie) === "2" &&
    isDashboardRoute
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";

    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );

  return response;
}

export const config = {
  matcher: [
    "/user/dashboard/:path*",
    "/admin/:path*",
  ],
};