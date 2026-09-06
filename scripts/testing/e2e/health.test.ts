import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_CONFIG } from '../helpers/env';
import { fetchWithTimeout, isServerReachable, logTestDetail } from '../helpers/test-utils';

describe('E2E Test: Server Health & Performance', () => {
  it('server web harus aktif dan merespons request', async (t) => {
    const reachable = await isServerReachable(TEST_CONFIG.baseUrl);

    if (!reachable) {
      t.skip(
        `Server di ${TEST_CONFIG.baseUrl} tidak aktif. Jalankan "npm run dev" terlebih dahulu untuk pengujian live E2E.`,
      );
      return;
    }

    const startTime = performance.now();
    const response = await fetchWithTimeout(TEST_CONFIG.baseUrl);
    const duration = performance.now() - startTime;

    assert.strictEqual(response.status, 200, `Halaman utama harus mengembalikan status 200, didapat: ${response.status}`);
    assert.ok(duration < 8000, `Respon server harus di bawah 8 detik, tercatat: ${duration}ms`);

    logTestDetail({
      title: 'Server Web Aktif & Merespons Permintaan',
      target: `GET ${TEST_CONFIG.baseUrl}`,
      status: response.status,
      statusText: response.statusText || 'OK',
      duration,
      response: `Server merespons dalam ${duration.toFixed(1)}ms dengan status HTTP 200`,
      headers: {
        'content-type': response.headers.get('content-type') || 'text/html',
        'cache-control': response.headers.get('cache-control') || 'none',
      },
    });
  });

  it('menyediakan header respon yang sesuai', async (t) => {
    const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
    if (!reachable) {
      t.skip('Server lokal tidak aktif.');
      return;
    }

    const startTime = performance.now();
    const response = await fetchWithTimeout(TEST_CONFIG.baseUrl);
    const duration = performance.now() - startTime;
    const contentType = response.headers.get('content-type');

    assert.ok(contentType, 'Header content-type harus ada');
    assert.ok(contentType.includes('text/html'), 'Content-type halaman utama harus berupa text/html');

    logTestDetail({
      title: 'Validasi Header Respon Halaman Utama',
      target: `GET ${TEST_CONFIG.baseUrl}`,
      status: response.status,
      statusText: 'OK',
      duration,
      response: `Header Content-Type valid: "${contentType}"`,
      headers: {
        'content-type': contentType,
        'x-powered-by': response.headers.get('x-powered-by') || 'Disabled (Secure)',
      },
    });
  });
});
