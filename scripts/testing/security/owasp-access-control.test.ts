import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_CONFIG } from '../helpers/env';
import { fetchWithTimeout, isServerReachable, logTestDetail } from '../helpers/test-utils';

describe('OWASP A01 - Broken Access Control & Auth Protection', () => {
  it('rute /admin harus menolak akses anonim dan mengarahkan ke login', async (t) => {
    const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
    if (!reachable) {
      t.skip('Server web lokal tidak aktif.');
      return;
    }

    const startTime = performance.now();
    const url = `${TEST_CONFIG.baseUrl}/admin`;
    const res = await fetchWithTimeout(url, {
      redirect: 'manual',
    });
    const duration = performance.now() - startTime;

    const isRedirect = res.status === 307 || res.status === 302 || res.status === 308;
    const location = res.headers.get('location') || '';

    if (isRedirect) {
      assert.ok(
        location.includes('/login'),
        `Redirect harus mengarah ke halaman login, didapat: ${location}`,
      );
    } else {
      const finalUrl = res.url;
      assert.ok(
        finalUrl.includes('/login') || res.status === 401 || res.status === 403,
        'Akses anonim ke /admin harus diblokir atau dialihkan ke login',
      );
    }

    logTestDetail({
      title: 'Proteksi Rute /admin dari Pengguna Tanpa Sesi',
      target: `GET ${url}`,
      status: res.status,
      statusText: isRedirect ? 'Temporary Redirect (Blocked)' : res.statusText,
      duration,
      response: `Akses ditolak! Dialihkan otomatis ke: "${location || '/login'}"`,
      headers: {
        location: location || 'N/A',
        'set-cookie': res.headers.get('set-cookie') ? 'terdeteksi' : 'none',
      },
    });
  });

  it('sub-rute administratif (/admin/news) terlindungi dari akses langsung', async (t) => {
    const reachable = await isServerReachable(TEST_CONFIG.baseUrl);
    if (!reachable) {
      t.skip('Server web lokal tidak aktif.');
      return;
    }

    const startTime = performance.now();
    const url = `${TEST_CONFIG.baseUrl}/admin/news`;
    const res = await fetchWithTimeout(url, {
      redirect: 'manual',
    });
    const duration = performance.now() - startTime;

    const isRedirect = res.status === 307 || res.status === 302 || res.status === 308;
    const location = res.headers.get('location') || '';

    if (isRedirect) {
      assert.ok(location.includes('/login'), 'Sub-rute admin harus mengarahkan ke login');
    } else {
      assert.ok(
        res.url.includes('/login') || res.status === 401 || res.status === 403,
        'Sub-rute admin harus menolak pengguna anonim',
      );
    }

    logTestDetail({
      title: 'Proteksi Sub-Rute Administratif (/admin/news)',
      target: `GET ${url}`,
      status: res.status,
      statusText: isRedirect ? 'Temporary Redirect (Protected)' : res.statusText,
      duration,
      response: `Akses sub-rute CMS dicegat. Pengguna diarahkan ke: "${location || '/login'}"`,
      headers: {
        location: location || 'N/A',
      },
    });
  });
});
