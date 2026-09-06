import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { logTestDetail } from '../helpers/test-utils';

describe('Integration Test: Interaction Validation & Processing', () => {
  const commentInputSchema = z.object({
    content: z.string().min(1, 'Konten komentar tidak boleh kosong').max(1000),
    contentType: z.enum(['news', 'announcement', 'achievement', 'article']),
    contentId: z.string().min(1, 'Content ID wajib diisi'),
    userId: z.string().optional().nullable(),
    authorName: z.string().min(2, 'Nama minimal 2 karakter').optional().nullable(),
  }).refine((data) => data.userId || (data.authorName && data.authorName.trim().length > 0), {
    message: 'Pengguna anonim wajib menyertakan nama.',
    path: ['authorName'],
  });

  it('lolos validasi komentar jika user login menyertakan userId', () => {
    const payload = {
      content: 'Selamat atas prestasinya!',
      contentType: 'achievement' as const,
      contentId: 'ach-01',
      userId: 'user-uuid-123',
      authorName: null,
    };

    const parseResult = commentInputSchema.safeParse(payload);
    assert.strictEqual(parseResult.success, true);

    logTestDetail({
      title: 'Validasi Komentar Pengguna Terdaftar (Authenticated User)',
      target: 'commentInputSchema.safeParse()',
      response: 'Validasi SUKSES (User ID terverifikasi mengesampingkan kebutuhan authorName)',
      details: {
        'Tipe Konten': payload.contentType,
        'Target ID': payload.contentId,
      },
    });
  });

  it('lolos validasi komentar anonim jika nama disertakan', () => {
    const payload = {
      content: 'Keren sekali prestasinya!',
      contentType: 'news' as const,
      contentId: 'news-99',
      userId: null,
      authorName: 'Alumni 2020',
    };

    const parseResult = commentInputSchema.safeParse(payload);
    assert.strictEqual(parseResult.success, true);

    logTestDetail({
      title: 'Validasi Komentar Pengguna Anonim dengan Nama',
      target: 'commentInputSchema.safeParse()',
      response: 'Validasi SUKSES (Nama anonim memenuhi syarat minimal 2 karakter)',
    });
  });

  it('gagal validasi jika komentar anonim tanpa nama', () => {
    const payload = {
      content: 'Halo semuanya',
      contentType: 'news' as const,
      contentId: 'news-99',
      userId: null,
      authorName: '',
    };

    const parseResult = commentInputSchema.safeParse(payload);
    assert.strictEqual(parseResult.success, false);

    logTestDetail({
      title: 'Penolakan Komentar Anonim Tanpa Nama',
      target: 'commentInputSchema.safeParse()',
      response: 'Validasi BERHASIL MENCEGAH: Komentar tanpa identitas ditolak oleh schema rule',
    });
  });

  it('gagal validasi jika contentId atau content kosong', () => {
    const payload = {
      content: '',
      contentType: 'news' as const,
      contentId: '',
      userId: 'user-1',
    };

    const parseResult = commentInputSchema.safeParse(payload);
    assert.strictEqual(parseResult.success, false);

    logTestDetail({
      title: 'Penolakan Payload Kosong / Malformed Content ID',
      target: 'commentInputSchema.safeParse()',
      response: 'Validasi BERHASIL MENCEGAH: Konten kosong ditolak secara presisi',
    });
  });
});
