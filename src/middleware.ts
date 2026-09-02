import NextAuth from 'next-auth';
import { authConfig } from '../scripts/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
    matcher: ['/admin/:path*', '/admin'],
};