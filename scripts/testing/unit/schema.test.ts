import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTableColumns } from 'drizzle-orm';
import { news, comments, likes, users } from '@/lib/db/schema';
import { logTestDetail } from '../helpers/test-utils';

describe('Unit Test: Drizzle Database Schemas', () => {
  describe('News Schema', () => {
    it('memiliki kolom yang sesuai dengan kebutuhan berita', () => {
      const columns = getTableColumns(news);
      assert.ok(columns.id, 'Kolom id harus ada');
      assert.ok(columns.title, 'Kolom title harus ada');
      assert.ok(columns.description, 'Kolom description harus ada');
      assert.ok(columns.date, 'Kolom date harus ada');
      assert.ok(columns.createdAt, 'Kolom createdAt harus ada');
      assert.ok(columns.updatedAt, 'Kolom updatedAt harus ada');

      logTestDetail({
        title: 'Verifikasi Skema Tabel Berita (news)',
        target: 'Drizzle Schema: news',
        response: `Semua ${Object.keys(columns).length} kolom wajib (id, title, description, date, createdAt, updatedAt) terverifikasi`,
      });
    });

    it('memiliki tipe kolom yang tepat', () => {
      const columns = getTableColumns(news);
      assert.strictEqual(columns.id.primary, true, 'id harus merupakan primary key');
      assert.strictEqual(columns.title.notNull, true, 'title tidak boleh null');

      logTestDetail({
        title: 'Verifikasi Constraints Skema news',
        target: 'Table Constraints: news',
        response: 'Primary key dan Not-Null constraint tervalidasi',
      });
    });
  });

  describe('Comments Schema', () => {
    it('memiliki kolom relasi dan audit', () => {
      const columns = getTableColumns(comments);
      assert.ok(columns.id, 'Kolom id harus ada');
      assert.ok(columns.content, 'Kolom content harus ada');
      assert.ok(columns.contentType, 'Kolom contentType harus ada');
      assert.ok(columns.contentId, 'Kolom contentId harus ada');
      assert.ok(columns.createdAt, 'Kolom createdAt harus ada');

      logTestDetail({
        title: 'Verifikasi Skema Tabel Komentar (comments)',
        target: 'Drizzle Schema: comments',
        response: 'Kolom relasi polymorphic (contentType, contentId) terdefinisi',
      });
    });

    it('memungkinkan komentar dari user terdaftar atau anonim', () => {
      const columns = getTableColumns(comments);
      assert.strictEqual(columns.userId.notNull, false, 'userId boleh null untuk komentar anonim');
      assert.strictEqual(columns.authorName.notNull, false, 'authorName boleh null jika user login');

      logTestDetail({
        title: 'Verifikasi Nullable Author Fields (comments)',
        target: 'Table Constraints: comments',
        response: 'Mendukung mode komentar akun terdaftar maupun anonim bertanda nama',
      });
    });
  });

  describe('Likes Schema', () => {
    it('memiliki kolom pelacak anonymousId dan userId', () => {
      const columns = getTableColumns(likes);
      assert.ok(columns.userId, 'Kolom userId harus ada');
      assert.ok(columns.anonymousId, 'Kolom anonymousId harus ada');
      assert.ok(columns.contentType, 'Kolom contentType harus ada');
      assert.ok(columns.contentId, 'Kolom contentId harus ada');

      logTestDetail({
        title: 'Verifikasi Skema Tabel Likes (likes)',
        target: 'Drizzle Schema: likes',
        response: 'Mendukung pelacakan likes berbasis userId dan anonymousId',
      });
    });
  });

  describe('Users Schema', () => {
    it('memiliki kolom otentikasi penting', () => {
      const columns = getTableColumns(users);
      assert.ok(columns.id, 'Kolom id harus ada');
      assert.ok(columns.email, 'Kolom email harus ada');
      assert.ok(columns.password, 'Kolom password harus ada');

      logTestDetail({
        title: 'Verifikasi Skema Tabel Pengguna (users)',
        target: 'Drizzle Schema: users',
        response: 'Kolom otentikasi id, email, dan password terdefinisi',
      });
    });
  });
});
