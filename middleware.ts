import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const restricted = path === '/pro' || path.startsWith('/pro/') || path === '/admin' || path.startsWith('/admin/');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Fail closed for protected routes until Supabase is configured.
  if (!url || !key) {
    if (restricted) return NextResponse.redirect(new URL('/?setup=required', request.url));
    return response;
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (restricted) {
    const expectedRole = path === '/admin' || path.startsWith('/admin/') ? 'admin' : 'pro';
    if (!user) return NextResponse.redirect(new URL('/?login=required', request.url));
    const { data: profile } = await supabase.from('profiles').select('role,is_blocked').eq('id', user.id).maybeSingle();
    if (profile?.role !== expectedRole || profile?.is_blocked) return NextResponse.redirect(new URL('/?access=denied', request.url));
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'] };
