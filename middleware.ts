import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Minimal middleware for CRUD Client (Next.js)
 * --------------------------------------------
 * - Prevents bots from re-triggering Auth0 redirects
 * - Keeps Auth0 callback/login routes clean
 * - Allows everything else to pass through
 */

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 🚫 Block duplicate access to callback/login/favicon while Auth0 is processing
    if (
        pathname.startsWith('/callback') ||
        pathname.startsWith('/login') ||
        pathname === '/favicon.ico'
    ) {
        // Let legitimate navigation still happen but prevent accidental re-POSTs or bot hits
        if (req.method !== 'GET') {
            return NextResponse.json({ ok: false, reason: 'Method not allowed' }, { status: 405 });
        }

        // For browser refresh on /callback, just go home safely
        if (pathname.startsWith('/callback') && !pathname.includes('code=')) {
            const url = req.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    // ✅ Default: continue request
    return NextResponse.next();
}

// Only run for these paths
export const config = {
    matcher: ['/callback/:path*', '/login/:path*', '/favicon.ico'],
};
