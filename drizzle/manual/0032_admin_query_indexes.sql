-- Run once in the Neon SQL Editor. These indexes are additive and safe to rerun.
CREATE INDEX IF NOT EXISTS sampah_kelas_kelas_tanggal_setoran_idx
    ON sampah_kelas (kelas_id, tanggal_setoran);
CREATE INDEX IF NOT EXISTS setoran_guru_guru_tanggal_setoran_idx
    ON setoran_guru (guru_id, tanggal_setoran);
CREATE INDEX IF NOT EXISTS waste_news_created_at_idx ON waste_news (created_at);
CREATE INDEX IF NOT EXISTS waste_documentation_created_at_idx ON waste_documentation (created_at);
CREATE INDEX IF NOT EXISTS waste_videos_created_at_idx ON waste_videos (created_at);
