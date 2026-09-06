import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '@/lib/utils';
import { logTestDetail } from '../helpers/test-utils';

describe('Unit Test: Utility Functions', () => {
  describe('cn() - Tailwind class merging', () => {
    it('menggabungkan class string biasa dengan benar', () => {
      const result = cn('btn', 'btn-primary');
      assert.strictEqual(result, 'btn btn-primary');

      logTestDetail({
        title: 'Class Merging Dasar (cn)',
        target: 'cn("btn", "btn-primary")',
        response: `Output: "${result}"`,
      });
    });

    it('menangani conditional class (boolean / falsy value)', () => {
      const isHidden = false;
      const isActive = true;
      const result = cn('base-class', isHidden && 'hidden', isActive && 'active', null, undefined);
      assert.strictEqual(result, 'base-class active');

      logTestDetail({
        title: 'Conditional Class Falsy Filtering',
        target: 'cn("base-class", false && "hidden", true && "active")',
        response: `Output: "${result}" (Falsy value dibersihkan)`,
      });
    });

    it('menyelesaikan konflik Tailwind utility classes dengan twMerge', () => {
      const result = cn('p-4 text-sm', 'p-8');
      assert.strictEqual(result, 'text-sm p-8');

      logTestDetail({
        title: 'Penyelesaian Konflik CSS Tailwind (twMerge)',
        target: 'cn("p-4 text-sm", "p-8")',
        response: `Output: "${result}" (p-4 berhasil ditimpa oleh p-8)`,
      });
    });

    it('menhandle object conditional syntax clsx', () => {
      const result = cn({
        'bg-red-500': true,
        'bg-blue-500': false,
        'text-white': true,
      });
      assert.strictEqual(result, 'bg-red-500 text-white');

      logTestDetail({
        title: 'Object Syntax Conditional Classes',
        target: 'cn({ "bg-red-500": true, "bg-blue-500": false })',
        response: `Output: "${result}"`,
      });
    });
  });

  describe('String formatting logic', () => {
    function formatSegmentTitle(segment: string): string {
      return decodeURIComponent(segment)
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    it('mengubah kebab-case menjadi Title Case yang rapi', () => {
      const result = formatSegmentTitle('prestasi-siswa-terbaru');
      assert.strictEqual(result, 'Prestasi Siswa Terbaru');

      logTestDetail({
        title: 'Format Slug Kebab-Case ke Title Case',
        target: 'formatSegmentTitle("prestasi-siswa-terbaru")',
        response: `Hasil: "${result}"`,
      });
    });

    it('mengubah snake_case menjadi Title Case', () => {
      const result = formatSegmentTitle('jadwal_kegiatan_sekolah');
      assert.strictEqual(result, 'Jadwal Kegiatan Sekolah');

      logTestDetail({
        title: 'Format Slug Snake_Case ke Title Case',
        target: 'formatSegmentTitle("jadwal_kegiatan_sekolah")',
        response: `Hasil: "${result}"`,
      });
    });

    it('menangani string ter-encode URL (%20, dsb)', () => {
      const result = formatSegmentTitle('ekstra%20kurikuler-pramuka');
      assert.strictEqual(result, 'Ekstra Kurikuler Pramuka');

      logTestDetail({
        title: 'Decoding & Normalisasi URL Encoded Slug',
        target: 'formatSegmentTitle("ekstra%20kurikuler-pramuka")',
        response: `Hasil: "${result}"`,
      });
    });
  });
});
