"use server";

import { db } from "@/lib/db";
import {
  guruSispendik,
  jenisSampah,
  kelas,
  sampahKelas,
  setoranGuru,
  setoranMasyarakat,
} from "@/lib/db/schema";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

const PUBLIC_CLASSES = Array.from({ length: 24 }, (_, index) => {
  const tingkat = 7 + Math.floor(index / 8);
  const huruf = String.fromCharCode(65 + (index % 8));
  return `${tingkat}${huruf}`;
});

function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = new Date(Date.UTC(nextYear, nextMonth - 1, 1, 0, 0, 0, 0));
  return { startDate, endDate };
}

function getYearDateRange(year: number) {
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));
  return { startDate, endDate };
}

export async function getPublicYearlyProgress(year: number) {
  try {
    const { startDate, endDate } = getYearDateRange(year);
    const totals = await db
      .select({
        className: sql<string>`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
        month: sql<number>`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})::int`,
        totalKg: sql<string>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric)), 0)`,
      })
      .from(sampahKelas)
      .innerJoin(kelas, eq(kelas.id, sampahKelas.kelasId))
      .where(
        and(
          gte(sampahKelas.tanggalSetoran, startDate),
          lt(sampahKelas.tanggalSetoran, endDate),
          sql`${kelas.tingkat} BETWEEN 7 AND 9`,
        ),
      )
      .groupBy(
        sql`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
        sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})`,
      );

    const byClassMonth = new Map(
      totals.map((item) => [
        `${item.className}-${Number(item.month)}`,
        Number(item.totalKg || 0),
      ]),
    );

    return {
      data: PUBLIC_CLASSES.map((className) => ({
        kelas: className,
        months: Array.from(
          { length: 12 },
          (_, index) => byClassMonth.get(`${className}-${index + 1}`) || 0,
        ),
      })),
    };
  } catch {
    return { error: "Gagal memuat perkembangan sampah tahunan." };
  }
}

export async function getPublicClassTotals(month: number, year: number) {
  try {
    const { startDate, endDate } = getMonthDateRange(month, year);
    const data = await db
      .select({
        kelasId: kelas.id,
        className: sql<string>`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
        tingkat: kelas.tingkat,
        huruf: kelas.huruf,
        total: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric)), 0)::float`,
        totalValue: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric) * CAST(${sampahKelas.hargaPerKgSnapshot} AS numeric)), 0)::float`,
        jenisList: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
        categories: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.kategori}, ', ')`,
      })
      .from(kelas)
      .leftJoin(
        sampahKelas,
        and(
          eq(sampahKelas.kelasId, kelas.id),
          gte(sampahKelas.tanggalSetoran, startDate),
          lt(sampahKelas.tanggalSetoran, endDate),
        ),
      )
      .leftJoin(jenisSampah, eq(jenisSampah.id, sampahKelas.jenisSampahId))
      .where(sql`${kelas.tingkat} BETWEEN 7 AND 9`)
      .groupBy(kelas.id, kelas.tingkat, kelas.huruf)
      .orderBy(kelas.tingkat, kelas.huruf);

    const totalsByClass = new Map(data.map((item) => [item.className, item]));
    return {
      data: PUBLIC_CLASSES.map((className) => {
        const item = totalsByClass.get(className);
        return (
          item || {
            kelasId: 0,
            className,
            tingkat: Number(className[0]),
            huruf: className[1],
            total: 0,
            totalValue: 0,
            jenisList: null,
            categories: null,
          }
        );
      }),
    };
  } catch {
    return { error: "Gagal memuat rekap setoran kelas." };
  }
}

export async function getPublicDashboardData(month: number, year: number) {
  try {
    const { startDate, endDate } = getMonthDateRange(month, year);
    const { startDate: yearStart, endDate: yearEnd } = getYearDateRange(year);

    const [
      yearlyProgressResult,
      classTotalsResult,
      studentSummary,
      teacherSummary,
      communitySummary,
      topWasteResult,
      guruRankingResult,
      masyarakatTotalsResult,
    ] = await Promise.all([
      // 1. Yearly progress with date range index
      db
        .select({
          className: sql<string>`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
          month: sql<number>`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})::int`,
          totalKg: sql<string>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric)), 0)`,
        })
        .from(sampahKelas)
        .innerJoin(kelas, eq(kelas.id, sampahKelas.kelasId))
        .where(
          and(
            gte(sampahKelas.tanggalSetoran, yearStart),
            lt(sampahKelas.tanggalSetoran, yearEnd),
            sql`${kelas.tingkat} BETWEEN 7 AND 9`,
          ),
        )
        .groupBy(
          sql`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
          sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})`,
        ),

      // 2. Class totals with date range index
      db
        .select({
          kelasId: kelas.id,
          className: sql<string>`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
          tingkat: kelas.tingkat,
          huruf: kelas.huruf,
          total: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric)), 0)::float`,
          totalValue: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric) * CAST(${sampahKelas.hargaPerKgSnapshot} AS numeric)), 0)::float`,
          jenisList: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
          categories: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.kategori}, ', ')`,
        })
        .from(kelas)
        .leftJoin(
          sampahKelas,
          and(
            eq(sampahKelas.kelasId, kelas.id),
            gte(sampahKelas.tanggalSetoran, startDate),
            lt(sampahKelas.tanggalSetoran, endDate),
          ),
        )
        .leftJoin(jenisSampah, eq(jenisSampah.id, sampahKelas.jenisSampahId))
        .where(sql`${kelas.tingkat} BETWEEN 7 AND 9`)
        .groupBy(kelas.id, kelas.tingkat, kelas.huruf)
        .orderBy(kelas.tingkat, kelas.huruf),

      // 3. Summary totals: student
      db
        .select({
          totalKg: sql<string>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric)), 0)`,
          totalValue: sql<string>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric) * CAST(${sampahKelas.hargaPerKgSnapshot} AS numeric)), 0)`,
        })
        .from(sampahKelas)
        .where(
          and(
            gte(sampahKelas.tanggalSetoran, startDate),
            lt(sampahKelas.tanggalSetoran, endDate),
          ),
        ),

      // 4. Summary totals: teacher
      db
        .select({
          totalKg: sql<string>`COALESCE(SUM(CAST(${setoranGuru.jumlahKg} AS numeric)), 0)`,
          totalValue: sql<string>`COALESCE(SUM(CAST(${setoranGuru.jumlahKg} AS numeric) * CAST(${setoranGuru.hargaPerKgSnapshot} AS numeric)), 0)`,
        })
        .from(setoranGuru)
        .where(
          and(
            gte(setoranGuru.tanggalSetoran, startDate),
            lt(setoranGuru.tanggalSetoran, endDate),
          ),
        ),

      // 5. Summary totals: community
      db
        .select({
          totalKg: sql<string>`COALESCE(SUM(CAST(${setoranMasyarakat.jumlahKg} AS numeric)), 0)`,
          totalValue: sql<string>`COALESCE(SUM(CAST(${setoranMasyarakat.jumlahKg} AS numeric) * CAST(${setoranMasyarakat.hargaPerKgSnapshot} AS numeric)), 0)`,
        })
        .from(setoranMasyarakat)
        .where(
          and(
            gte(setoranMasyarakat.tanggalSetoran, startDate),
            lt(setoranMasyarakat.tanggalSetoran, endDate),
          ),
        ),

      // 6. Top 3 waste types (unified SQL query)
      db.execute(sql`
        WITH combined AS (
          SELECT jenis_sampah_id, jumlah_kg FROM ${sampahKelas} WHERE ${sampahKelas.tanggalSetoran} >= ${startDate} AND ${sampahKelas.tanggalSetoran} < ${endDate}
          UNION ALL
          SELECT jenis_sampah_id, jumlah_kg FROM ${setoranGuru} WHERE ${setoranGuru.tanggalSetoran} >= ${startDate} AND ${setoranGuru.tanggalSetoran} < ${endDate}
          UNION ALL
          SELECT jenis_sampah_id, jumlah_kg FROM ${setoranMasyarakat} WHERE ${setoranMasyarakat.tanggalSetoran} >= ${startDate} AND ${setoranMasyarakat.tanggalSetoran} < ${endDate}
        )
        SELECT 
          js.nama_sampah AS "wasteType",
          js.kategori AS "category",
          COALESCE(SUM(CAST(c.jumlah_kg AS numeric)), 0)::float AS "totalKg",
          0::float AS "totalValue"
        FROM combined c
        JOIN ${jenisSampah} js ON js.id = c.jenis_sampah_id
        GROUP BY js.id, js.nama_sampah, js.kategori
        ORDER BY "totalKg" DESC
        LIMIT 3
      `),

      // 7. Guru ranking
      db
        .select({
          guruName: guruSispendik.namaGuru,
          totalKg: sql<number>`COALESCE(SUM(CAST(${setoranGuru.jumlahKg} AS numeric)), 0)::float`,
          wasteTypes: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
          categories: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.kategori}, ', ')`,
        })
        .from(setoranGuru)
        .innerJoin(guruSispendik, eq(setoranGuru.guruId, guruSispendik.id))
        .innerJoin(jenisSampah, eq(setoranGuru.jenisSampahId, jenisSampah.id))
        .where(
          and(
            gte(setoranGuru.tanggalSetoran, startDate),
            lt(setoranGuru.tanggalSetoran, endDate),
          ),
        )
        .groupBy(guruSispendik.id, guruSispendik.namaGuru)
        .orderBy(desc(sql`SUM(CAST(${setoranGuru.jumlahKg} AS numeric))`)),

      // 8. Masyarakat totals
      db
        .select({
          wasteType: jenisSampah.namaSampah,
          category: jenisSampah.kategori,
          totalKg: sql<number>`COALESCE(SUM(CAST(${setoranMasyarakat.jumlahKg} AS numeric)), 0)::float`,
        })
        .from(setoranMasyarakat)
        .innerJoin(
          jenisSampah,
          eq(setoranMasyarakat.jenisSampahId, jenisSampah.id),
        )
        .where(
          and(
            gte(setoranMasyarakat.tanggalSetoran, startDate),
            lt(setoranMasyarakat.tanggalSetoran, endDate),
          ),
        )
        .groupBy(jenisSampah.id, jenisSampah.namaSampah, jenisSampah.kategori)
        .orderBy(desc(sql`SUM(CAST(${setoranMasyarakat.jumlahKg} AS numeric))`)),
    ]);

    // Format yearly progress
    const byClassMonth = new Map(
      yearlyProgressResult.map((item) => [
        `${item.className}-${Number(item.month)}`,
        Number(item.totalKg || 0),
      ]),
    );
    const progress = PUBLIC_CLASSES.map((className) => ({
      kelas: className,
      months: Array.from(
        { length: 12 },
        (_, index) => byClassMonth.get(`${className}-${index + 1}`) || 0,
      ),
    }));

    // Format class totals
    const totalsByClass = new Map(
      classTotalsResult.map((item) => [item.className, item]),
    );
    const classTotals = PUBLIC_CLASSES.map((className) => {
      const item = totalsByClass.get(className);
      return (
        item || {
          kelasId: 0,
          className,
          tingkat: Number(className[0]),
          huruf: className[1],
          total: 0,
          totalValue: 0,
          jenisList: null,
          categories: null,
        }
      );
    });

    // Format summary
    const totalKg =
      Number(studentSummary[0]?.totalKg || 0) +
      Number(teacherSummary[0]?.totalKg || 0) +
      Number(communitySummary[0]?.totalKg || 0);
    const totalValue =
      Number(studentSummary[0]?.totalValue || 0) +
      Number(teacherSummary[0]?.totalValue || 0) +
      Number(communitySummary[0]?.totalValue || 0);

    // Format top waste types
    const topWasteRows = (topWasteResult.rows || topWasteResult || []) as any[];
    const topWasteTypes = topWasteRows.map((row) => ({
      wasteType: String(row.wasteType || ""),
      totalKg: Number(row.totalKg || 0),
      category: row.category ? String(row.category) : undefined,
      totalValue: 0,
    }));

    return {
      data: {
        progress,
        classTotals,
        summary: { totalKg, totalValue },
        topWasteTypes,
        guruRanking: guruRankingResult || [],
        masyarakatTotals: masyarakatTotalsResult || [],
      },
    };
  } catch (error) {
    console.error("Failed to load public sispendik dashboard data:", error);
    return { error: "Gagal memuat data setoran sampah." };
  }
}
