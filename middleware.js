import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Liste des redirections
  const redirects = {
    "/git": "https://github.com/moddy-app",
    "/support": "https://discord.gg/5XPG6CXRUB",
    "/invite": "https://discord.com/oauth2/authorize?client_id=1373916203814490194"
  };

  if (redirects[pathname]) {
    return NextResponse.redirect(redirects[pathname]);
  }

  return NextResponse.next();
}
