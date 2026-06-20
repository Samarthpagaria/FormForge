import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, CookieOptions } from '@supabase/ssr'

const isPublicRoute = (pathname: string) => {
  return [
    "/",
    "/sign-in",
    "/sign-up",
    "/docs",
  ].includes(pathname) || 
  pathname.startsWith('/f/') || 
  pathname.startsWith('/api/') || 
  pathname.includes('/builder');
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up');

    // If user is already authenticated and visits sign-in or sign-up, redirect them to dashboard
    if (session?.user && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!session?.user && !isPublicRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  } catch (error: any) {
    // If anything fails (like missing env vars), return the error as JSON so we can see it!
    return NextResponse.json({ 
      middleware_crashed: true, 
      error: error?.message || "Unknown error",
      url_env: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
      key_env: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing",
    }, { status: 500 });
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
};