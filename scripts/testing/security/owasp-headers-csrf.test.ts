import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_CONFIG } from '../helpers/env';
import { fetchWithTimeout, isServerReachable, logTestDetail } from '../helpers/test-utils';

describe('OWASP A05 & A07 - Security Headers & CSRF Protection', () => {
  describe('OWASP HTTP Security Headers', () => {
    it('memiliki header X-Frame-Options untuk mencegah Clickjacking', async (t) => {
      const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
      if (!reachable) {
        t.skip('Server web lokal tidak aktif.');
        return;
      }

      const startTime = performance.now();
      const res = await fetchWithTimeout(TEST_CONFIG.baseUrl);
      const duration = performance.now() - startTime;
      const xFrameOptions = res.headers.get('x-frame-options');

      assert.ok(
        xFrameOptions,
        'Header x-frame-options harus dikirim oleh server untuk proteksi clickjacking',
      );
      assert.ok(
        xFrameOptions.toUpperCase() === 'SAMEORIGIN' || xFrameOptions.toUpperCase() === 'DENY',
        `Nilai x-frame-options harus SAMEORIGIN atau DENY, didapat: ${xFrameOptions}`,
      );

      logTestDetail({
        title: 'Anti-Clickjacking: X-Frame-Options Header',
        target: `GET ${TEST_CONFIG.baseUrl}`,
        status: res.status,
        duration,
        response: `Frame policy diatur ketat: "${xFrameOptions}" (Situs tidak dapat di-embed iframe asing)`,
        headers: {
          'x-frame-options': xFrameOptions,
        },
      });
    });

    it('memiliki header X-Content-Type-Options untuk mencegah MIME Sniffing', async (t) => {
      const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
      if (!reachable) {
        t.skip('Server web lokal tidak aktif.');
        return;
      }

      const startTime = performance.now();
      const res = await fetchWithTimeout(TEST_CONFIG.baseUrl);
      const duration = performance.now() - startTime;
      const xContentType = res.headers.get('x-content-type-options');

      assert.ok(xContentType, 'Header x-content-type-options harus ada');
      assert.strictEqual(
        xContentType.toLowerCase(),
        'nosniff',
        'x-content-type-options harus bernilai nosniff',
      );

      logTestDetail({
        title: 'MIME Sniffing Prevention: X-Content-Type-Options',
        target: `GET ${TEST_CONFIG.baseUrl}`,
        status: res.status,
        duration,
        response: `MIME policy: "${xContentType}" (Browser dilarang menebak format file executable)`,
        headers: {
          'x-content-type-options': xContentType,
        },
      });
    });

    it('memiliki Referrer-Policy yang aman', async (t) => {
      const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
      if (!reachable) {
        t.skip('Server web lokal tidak aktif.');
        return;
      }

      const startTime = performance.now();
      const res = await fetchWithTimeout(TEST_CONFIG.baseUrl);
      const duration = performance.now() - startTime;
      const referrerPolicy = res.headers.get('referrer-policy');

      assert.ok(referrerPolicy, 'Header referrer-policy harus dikirim');
      assert.ok(
        referrerPolicy.includes('origin') || referrerPolicy.includes('no-referrer'),
        `Referrer policy harus membatasi kebocoran URL referer: ${referrerPolicy}`,
      );

      logTestDetail({
        title: 'Referrer Data Leak Prevention: Referrer-Policy',
        target: `GET ${TEST_CONFIG.baseUrl}`,
        status: res.status,
        duration,
        response: `Referrer policy: "${referrerPolicy}" (Mencegah URL internal bocor ke situs luar)`,
        headers: {
          'referrer-policy': referrerPolicy,
        },
      });
    });
  });

  describe('CSRF Protection', () => {
    it('endpoint auth NextAuth menghasilkan CSRF token unik', async (t) => {
      const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
      if (!reachable) {
        t.skip('Server web lokal tidak aktif.');
        return;
      }

      const startTime = performance.now();
      const url = `${TEST_CONFIG.baseUrl}/api/auth/csrf`;
      const res = await fetchWithTimeout(url);
      const duration = performance.now() - startTime;
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as { csrfToken?: string };
      assert.ok(data.csrfToken, 'Response harus memuat token csrfToken');
      assert.ok(data.csrfToken.length >= 32, 'Panjang token CSRF harus aman dan tidak tertebak');

      logTestDetail({
        title: 'Anti-CSRF Token Generation & Verification',
        target: `GET ${url}`,
        status: res.status,
        duration,
        response: `Token acak kriptografis: ${data.csrfToken.slice(0, 16)}... (Panjang: ${data.csrfToken.length} karakter)`,
      });
    });
  });
});
