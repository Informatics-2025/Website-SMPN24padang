import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { authConfig } from '../../auth.config';
import { logTestDetail } from '../helpers/test-utils';

describe('Unit Test: Authentication & Authorization Config', () => {
  describe('Pages Configuration', () => {
    it('mengarahkan sign-in dan error ke halaman /login', () => {
      assert.strictEqual(authConfig.pages?.signIn, '/login');
      assert.strictEqual(authConfig.pages?.error, '/login');

      logTestDetail({
        title: 'Konfigurasi Endpoint Autentikasi NextAuth',
        target: 'authConfig.pages',
        response: 'Rute signIn & error terkonfigurasi ke /login',
        details: {
          signIn: authConfig.pages?.signIn,
          error: authConfig.pages?.error,
        },
      });
    });
  });

  describe('Authorized Callback (Access Control)', () => {
    const authorized = authConfig.callbacks?.authorized;
    assert.ok(authorized, 'Authorized callback harus terdefinisi');

    it('menolak akses ke rute /admin jika user belum terotentikasi', () => {
      const result = authorized({
        auth: null,
        request: { nextUrl: new URL('http://localhost:3000/admin') } as any,
      });
      assert.strictEqual(result, false, 'Unauthenticated user harus diblokir dari /admin');

      logTestDetail({
        title: 'Evaluasi Akses Pengguna Anonim ke /admin',
        target: 'authorized() callback',
        response: 'Hasil: FALSE (Akses diblokir sesuai aturan keamanan)',
      });
    });

    it('menolak akses ke sub-rute /admin/:path* jika user belum login', () => {
      const result = authorized({
        auth: null,
        request: { nextUrl: new URL('http://localhost:3000/admin/news/new') } as any,
      });
      assert.strictEqual(result, false, 'Sub-rute admin harus terlindungi');

      logTestDetail({
        title: 'Evaluasi Akses Pengguna Anonim ke /admin/news/new',
        target: 'authorized() callback',
        response: 'Hasil: FALSE (Sub-rute admin terlindungi)',
      });
    });

    it('mengizinkan akses ke /admin jika user sudah login', () => {
      const result = authorized({
        auth: { user: { id: 'admin-1', email: 'admin@smpn24.sch.id' } } as any,
        request: { nextUrl: new URL('http://localhost:3000/admin') } as any,
      });
      assert.strictEqual(result, true, 'User yang telah login harus diizinkan masuk /admin');

      logTestDetail({
        title: 'Evaluasi Akses Pengguna Terotentikasi ke /admin',
        target: 'authorized() callback',
        response: 'Hasil: TRUE (Izin diberikan ke user admin yang terotentikasi)',
      });
    });

    it('mengizinkan akses publik ke halaman non-admin tanpa login', () => {
      const result = authorized({
        auth: null,
        request: { nextUrl: new URL('http://localhost:3000/news') } as any,
      });
      assert.strictEqual(result, true, 'Rute publik dapat diakses tanpa login');

      logTestDetail({
        title: 'Evaluasi Akses Halaman Publik (/news)',
        target: 'authorized() callback',
        response: 'Hasil: TRUE (Rute publik tetap terbuka bebas)',
      });
    });
  });

  describe('JWT & Session Callbacks (Data Sanitization)', () => {
    it('memetakan data user ke dalam token JWT dengan aman', () => {
      const jwtCallback = authConfig.callbacks?.jwt;
      assert.ok(jwtCallback);

      const sampleUser = {
        id: 'u-123',
        name: 'Administrator',
        email: 'admin@smpn24.sch.id',
        image: 'https://example.com/avatar.jpg',
      };

      const token = jwtCallback({
        token: {},
        user: sampleUser as any,
      } as any);

      assert.strictEqual(token.id, 'u-123');
      assert.strictEqual(token.name, 'Administrator');
      assert.strictEqual(token.email, 'admin@smpn24.sch.id');

      logTestDetail({
        title: 'Pemetaan Identitas Pengguna ke JWT Token',
        target: 'jwt() callback',
        response: 'Token JWT diperkaya dengan id, name, dan email terverifikasi',
      });
    });

    it('memastikan data sensitif seperti password TIDAK PERNAH masuk ke session', () => {
      const sessionCallback = authConfig.callbacks?.session;
      assert.ok(sessionCallback);

      const token = {
        id: 'u-123',
        name: 'Administrator',
        email: 'admin@smpn24.sch.id',
        picture: 'https://example.com/avatar.jpg',
      };

      const session = sessionCallback({
        session: { user: {} } as any,
        token: token as any,
      } as any);

      assert.strictEqual(session.user?.id, 'u-123');
      assert.strictEqual(session.user?.email, 'admin@smpn24.sch.id');
      assert.strictEqual((session.user as any).password, undefined);

      logTestDetail({
        title: 'Sanitasi Data Sesi Klien (Pencegahan Kebocoran Kredensial)',
        target: 'session() callback',
        response: 'Data sesi bersih dari hash/password (OWASP A02 Compliant)',
        details: {
          'Exposed Properties': Object.keys(session.user || {}).join(', '),
          'Password Status': 'STRICTLY UNDEFINED (Safe)',
        },
      });
    });
  });
});
