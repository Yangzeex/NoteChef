import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/webhooks(.*)",
  "/recipe/:id",
  "/profile/:username",
  "/explore(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth();

  if (!isPublicRoute(req)) {
    auth().protect();
  }

  // Redirect authenticated users who haven't completed onboarding
  if (
    userId &&
    !req.nextUrl.pathname.startsWith("/onboarding") &&
    !req.nextUrl.pathname.startsWith("/api") &&
    (sessionClaims?.metadata as Record<string, unknown>)?.onboarded !== true
  ) {
    // Only redirect from the home feed — avoids redirect loops on public pages
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
