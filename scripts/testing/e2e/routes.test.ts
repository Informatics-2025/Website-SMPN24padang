import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_CONFIG } from '../helpers/env';
import { fetchWithTimeout, isServerReachable, logTestDetail } from '../helpers/test-utils';

describe('E2E Test: Application Routes Accessibility', () => {
  it('rute halaman utama (/) dapat diakses', async (t) => {
    const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
    if (!reachable) {
      t.skip('Server web lokal tidak aktif.');
      return;
    }

    const startTime = performance.now();
    const url = `${TEST_CONFIG.baseUrl}/`;
    const res = await fetchWithTimeout(url);
    const duration = performance.now() - startTime;
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.length > 100, 'Konten HTML halaman utama harus ter-render');

    logTestDetail({
      title: 'Akses Rute Beranda (Homepage)',
      target: `GET ${url}`,
      status: res.status,
      statusText: 'OK',
      duration,
      response: `Ukuran Dokumen: ${(html.length / 1024).toFixed(1)} KB (HTML ter-render lengkap)`,
      headers: {
        'content-type': res.headers.get('content-type') || '',
        'x-frame-options': res.headers.get('x-frame-options') || '',
      },
    });
  });

  it('rute halaman login (/login) dapat diakses', async (t) => {
    const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
    if (!reachable) {
      t.skip('Server web lokal tidak aktif.');
      return;
    }

    const startTime = performance.now();
    const url = `${TEST_CONFIG.baseUrl}/login`;
    const res = await fetchWithTimeout(url);
    const duration = performance.now() - startTime;
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.toLowerCase().includes('login') || html.includes('form'), 'Halaman login harus memuat elemen login');

    logTestDetail({
      title: 'Akses Rute Halaman Login',
      target: `GET ${url}`,
      status: res.status,
      statusText: 'OK',
      duration,
      response: `Formulir otentikasi login terdeteksi (${(html.length / 1024).toFixed(1)} KB)`,
      headers: {
        'content-type': res.headers.get('content-type') || '',
      },
    });
  });

  it('file robots.txt untuk SEO tersedia dan valid', async (t) => {
    const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
    if (!reachable) {
      t.skip('Server web lokal tidak aktif.');
      return;
    }

    const startTime = performance.now();
    const url = `${TEST_CONFIG.baseUrl}/robots.txt`;
    const res = await fetchWithTimeout(url);
    const duration = performance.now() - startTime;
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('User-Agent:') || body.includes('User-agent:'), 'Robots.txt harus berisi direktif User-Agent');

    const firstLine = body.split('\n')[0] || '';
    logTestDetail({
      title: 'File robots.txt (SEO Crawler Directives)',
      target: `GET ${url}`,
      status: res.status,
      statusText: 'OK',
      duration,
      response: `Direktif: "${firstLine.trim()}" | Total baris: ${body.split('\n').length}`,
      headers: {
        'content-type': res.headers.get('content-type') || '',
      },
    });
  });

  it('endpoint API Auth CSRF token (/api/auth/csrf) merespons dengan JSON valid', async (t) => {
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
    const json = (await res.json()) as { csrfToken?: string };
    assert.ok(json.csrfToken !== undefined, 'Response CSRF harus memuat token');

    const tokenPreview = json.csrfToken ? `${json.csrfToken.slice(0, 12)}... (panjang: ${json.csrfToken.length})` : 'none';
    logTestDetail({
      title: 'API Auth CSRF Token Endpoint',
      target: `GET ${url}`,
      status: res.status,
      statusText: 'OK',
      duration,
      response: `CSRF Token Valid: ${tokenPreview}`,
      headers: {
        'content-type': res.headers.get('content-type') || '',
      },
    });
  });
});
