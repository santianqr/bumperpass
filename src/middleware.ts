export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/account/:path*",
    "/verify-email",
    "/logout",
    "/forgot-password",
    "/vg",
  ],
};
