import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCurriculumDocuments,
  createCurriculumDocument,
  updateCurriculumDocument,
  deleteCurriculumDocument,
} from '@/lib/curriculum';
import { logTestDetail } from '../helpers/test-utils';

describe('Unit Test: Curriculum Module', () => {
  it('dapat mengambil data dokumen kurikulum berdasarkan kategori', async () => {
    const category = 'semester-1';
    const result = await getCurriculumDocuments(category);

    assert.ok(result, 'Result harus didefinisikan');
    assert.strictEqual(result.error, null);
    assert.ok(Array.isArray(result.data), 'Data harus berupa array');
    assert.ok(result.data.length > 0, 'Harus mengembalikan setidaknya satu dokumen');
    assert.strictEqual(result.data[0].category, category);

    logTestDetail({
      title: 'Pengambilan Dokumen Kurikulum per Kategori',
      target: `getCurriculumDocuments("${category}")`,
      response: `Berhasil mengambil ${result.data.length} dokumen. Judul: "${result.data[0].title}"`,
      details: {
        'Category Query': category,
        'Format': 'PDF Link Ready',
      },
    });
  });

  it('dapat membuat dokumen kurikulum baru', async () => {
    const newDoc = {
      title: 'Kurikulum Merdeka 2026',
      description: 'Panduan kurikulum terpadu',
      pdfUrl: 'https://example.com/kurikulum.pdf',
      category: 'kurikulum-utama',
    };

    const result = await createCurriculumDocument(newDoc);
    assert.deepStrictEqual(result, { success: true });

    logTestDetail({
      title: 'Pembuatan Entri Kurikulum Baru',
      target: 'createCurriculumDocument()',
      response: 'Entri berhasil dibuat dengan status { success: true }',
    });
  });

  it('dapat memperbarui dokumen kurikulum', async () => {
    const updatedData = {
      title: 'Kurikulum Merdeka Revisi',
      description: 'Revisi panduan',
      pdfUrl: 'https://example.com/kurikulum-revisi.pdf',
      category: 'kurikulum-utama',
    };

    const result = await updateCurriculumDocument(1, updatedData);
    assert.deepStrictEqual(result, { success: true });

    logTestDetail({
      title: 'Pembaruan Dokumen Kurikulum (ID: 1)',
      target: 'updateCurriculumDocument(1, payload)',
      response: 'Pembaruan berhasil tersimpan',
    });
  });

  it('dapat menghapus dokumen kurikulum', async () => {
    const result = await deleteCurriculumDocument(1);
    assert.deepStrictEqual(result, { success: true });

    logTestDetail({
      title: 'Penghapusan Dokumen Kurikulum (ID: 1)',
      target: 'deleteCurriculumDocument(1)',
      response: 'Dokumen berhasil dihapus',
    });
  });
});
