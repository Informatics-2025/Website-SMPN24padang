import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    if (!req.auth) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*', '/admin'],
};
