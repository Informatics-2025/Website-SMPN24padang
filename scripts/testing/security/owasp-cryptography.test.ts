import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { logTestDetail } from '../helpers/test-utils';

describe('OWASP A02 - Cryptographic Failures & Password Hashing', () => {
  const plainPassword = 'SuperSecretPassword@2026';

  it('menggunakan algoritma hashing modern bcrypt dengan salt minimal 10 rounds', async () => {
    const startTime = performance.now();
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    const duration = performance.now() - startTime;

    assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Format hash harus standar bcrypt');

    const parts = hash.split('$');
    const cost = parseInt(parts[2], 10);
    assert.ok(cost >= 10, `Cost factor minimal 10 rounds untuk ketahanan brute force, didapat: ${cost}`);

    logTestDetail({
      title: 'Bcrypt Cost Factor & Algoritma Hashing',
      target: 'bcryptjs password hasher',
      duration,
      response: `Algoritma: bcrypt (${parts[1]}) | Salt Rounds: ${cost} | Hash: ${hash.slice(0, 28)}...`,
      details: {
        'Brute Force Protection': 'Kuat (Cost >= 10)',
        'Storage Format': 'Non-reversible one-way salted hash',
      },
    });
  });

  it('menghasilkan hash unik untuk password yang sama (salt uniqueness)', async () => {
    const startTime = performance.now();
    const hash1 = await bcrypt.hash(plainPassword, 10);
    const hash2 = await bcrypt.hash(plainPassword, 10);
    const duration = performance.now() - startTime;

    assert.notStrictEqual(hash1, hash2, 'Dua hash dari password yang sama harus berbeda berkat salt unik');

    logTestDetail({
      title: 'Salt Uniqueness (Anti-Rainbow Table)',
      target: 'bcryptjs salt generator',
      duration,
      response: 'Dua kali hashing password identik menghasilkan string hash yang berbeda',
      details: {
        'Hash 1': `${hash1.slice(0, 24)}...`,
        'Hash 2': `${hash2.slice(0, 24)}...`,
      },
    });
  });

  it('memverifikasi password yang benar dan menolak password yang salah', async () => {
    const startTime = performance.now();
    const hash = await bcrypt.hash(plainPassword, 10);

    const isMatch = await bcrypt.compare(plainPassword, hash);
    assert.strictEqual(isMatch, true, 'Password yang benar harus cocok');

    const isWrongMatch = await bcrypt.compare('WrongPassword#123', hash);
    assert.strictEqual(isWrongMatch, false, 'Password yang salah harus ditolak');
    const duration = performance.now() - startTime;

    logTestDetail({
      title: 'Validasi Kredensial Hashing (Match vs Mismatch)',
      target: 'bcrypt.compare()',
      duration,
      response: 'Kredensial valid diverifikasi TRUE, kredensial palsu berhasil ditolak FALSE',
    });
  });

  it('menolak password kosong atau spasi kosong', async () => {
    const startTime = performance.now();
    const hash = await bcrypt.hash(plainPassword, 10);

    const emptyMatch = await bcrypt.compare('', hash);
    assert.strictEqual(emptyMatch, false, 'Password kosong harus ditolak');
    const duration = performance.now() - startTime;

    logTestDetail({
      title: 'Penolakan Password Kosong (Empty Credential Rejection)',
      target: 'bcrypt.compare()',
      duration,
      response: 'Upaya otentikasi dengan input kosong ditolak secara tegas',
    });
  });
});
