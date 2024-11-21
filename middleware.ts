import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .single()

    // If no profile exists and not already on setup page, redirect to account setup
    if (!profile && !req.nextUrl.pathname.includes('/account/setup')) {
      return NextResponse.redirect(new URL('/account/setup', req.url))
    }
  }

  // Prevent authenticated users from accessing auth pages
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/account/:path*'],
} 