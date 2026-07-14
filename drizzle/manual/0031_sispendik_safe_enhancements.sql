-- MANUAL, ADDITIVE migration for the SISPENDIG enhancement.
-- Do NOT run `drizzle-kit push` or `drizzle-kit migrate` for this change.
-- Run this exact file once in the Neon SQL Editor only after taking a backup.
-- It adds columns/tables and backfills values; it does not delete or rename data.

BEGIN;

ALTER TABLE jenis_sampah
    ADD COLUMN IF NOT EXISTS kategori varchar(12) NOT NULL DEFAULT 'anorganik';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'jenis_sampah_kategori_check'
    ) THEN
        ALTER TABLE jenis_sampah
            ADD CONSTRAINT jenis_sampah_kategori_check
            CHECK (kategori IN ('organik', 'anorganik'));
    END IF;
END $$;

ALTER TABLE sampah_kelas
    ADD COLUMN IF NOT EXISTS harga_per_kg_snapshot numeric(10, 2),
    ADD COLUMN IF NOT EXISTS tanggal_setoran timestamp;

UPDATE sampah_kelas sk
SET
    harga_per_kg_snapshot = COALESCE(sk.harga_per_kg_snapshot, js.harga_per_kg),
    tanggal_setoran = COALESCE(sk.tanggal_setoran, sk.created_at)
FROM jenis_sampah js
WHERE js.id = sk.jenis_sampah_id
  AND (sk.harga_per_kg_snapshot IS NULL OR sk.tanggal_setoran IS NULL);

ALTER TABLE sampah_kelas
    ALTER COLUMN harga_per_kg_snapshot SET NOT NULL,
    ALTER COLUMN tanggal_setoran SET NOT NULL;

ALTER TABLE setoran_guru
    ADD COLUMN IF NOT EXISTS harga_per_kg_snapshot numeric(10, 2),
    ADD COLUMN IF NOT EXISTS tanggal_setoran timestamp;

UPDATE setoran_guru sg
SET
    harga_per_kg_snapshot = COALESCE(sg.harga_per_kg_snapshot, js.harga_per_kg),
    tanggal_setoran = COALESCE(sg.tanggal_setoran, sg.created_at)
FROM jenis_sampah js
WHERE js.id = sg.jenis_sampah_id
  AND (sg.harga_per_kg_snapshot IS NULL OR sg.tanggal_setoran IS NULL);

ALTER TABLE setoran_guru
    ALTER COLUMN harga_per_kg_snapshot SET NOT NULL,
    ALTER COLUMN tanggal_setoran SET NOT NULL;

CREATE TABLE IF NOT EXISTS setoran_masyarakat (
    id serial PRIMARY KEY,
    nama_penyetor varchar(255) NOT NULL,
    jenis_sampah_id integer NOT NULL REFERENCES jenis_sampah(id),
    jumlah_kg numeric(10, 2) NOT NULL CHECK (jumlah_kg > 0),
    harga_per_kg_snapshot numeric(10, 2) NOT NULL CHECK (harga_per_kg_snapshot >= 0),
    tanggal_setoran timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sampah_kelas_tanggal_setoran_idx
    ON sampah_kelas (tanggal_setoran);
CREATE INDEX IF NOT EXISTS setoran_guru_tanggal_setoran_idx
    ON setoran_guru (tanggal_setoran);
CREATE INDEX IF NOT EXISTS setoran_masyarakat_tanggal_setoran_idx
    ON setoran_masyarakat (tanggal_setoran);

COMMIT;
