"use server";

import { db } from "@/lib/db";
import { jenisSampah, kelas, sampahKelas } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

const PUBLIC_CLASSES = Array.from({ length: 24 }, (_, index) => {
  const tingkat = 7 + Math.floor(index / 8);
  const huruf = String.fromCharCode(65 + (index % 8));
  return `${tingkat}${huruf}`;
});

export async function getPublicYearlyProgress(year: number) {
  try {
    const totals = await db
      .select({
        className: sql<string>`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
        month: sql<number>`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})`,
        totalKg: sql<string>`SUM(${sampahKelas.jumlahKg})`,
      })
      .from(sampahKelas)
      .innerJoin(kelas, eq(kelas.id, sampahKelas.kelasId))
      .where(
        and(
          sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`,
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
    const data = await db
      .select({
        kelasId: kelas.id,
        className: sql<string>`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
        tingkat: kelas.tingkat,
        huruf: kelas.huruf,
        total: sql<number>`COALESCE(SUM(${sampahKelas.jumlahKg}), 0)`,
        totalValue: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric) * CAST(${sampahKelas.hargaPerKgSnapshot} AS numeric)), 0)`,
        jenisList: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
        categories: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.kategori}, ', ')`,
      })
      .from(kelas)
      .leftJoin(
        sampahKelas,
        and(
          eq(sampahKelas.kelasId, kelas.id),
          sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran}) = ${month}`,
          sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`,
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

export async function getAggregatedData() {
  try {
    const result = await db
      .select({
        kelasId: sampahKelas.kelasId,
        tingkat: kelas.tingkat,
        huruf: kelas.huruf,
        totalKg: sql<string>`SUM(${sampahKelas.jumlahKg})`,
        totalNilai: sql<string>`SUM(${sampahKelas.jumlahKg} * ${jenisSampah.hargaPerKg})`,
      })
      .from(sampahKelas)
      .leftJoin(kelas, eq(kelas.id, sampahKelas.kelasId))
      .leftJoin(jenisSampah, eq(jenisSampah.id, sampahKelas.jenisSampahId))
      .groupBy(sampahKelas.kelasId, kelas.tingkat, kelas.huruf)
      .orderBy(
        desc(
          sql<string>`SUM(${sampahKelas.jumlahKg} * ${jenisSampah.hargaPerKg})`,
        ),
      );

    return { data: result };
  } catch (error) {
    return { error: "Failed to fetch aggregated data" };
  }
}

export async function getMonthlyStats() {
  try {
    const result = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${sampahKelas.createdAt})`,
        totalKg: sql<string>`SUM(${sampahKelas.jumlahKg})`,
        totalNilai: sql<string>`SUM(${sampahKelas.jumlahKg} * ${jenisSampah.hargaPerKg})`,
      })
      .from(sampahKelas)
      .leftJoin(jenisSampah, eq(jenisSampah.id, sampahKelas.jenisSampahId))
      .groupBy(sql<string>`DATE_TRUNC('month', ${sampahKelas.createdAt})`)
      .orderBy(sql<string>`DATE_TRUNC('month', ${sampahKelas.createdAt})`);

    return { data: result };
  } catch (error) {
    return { error: "Failed to fetch monthly stats" };
  }
}

export async function getWasteTypeSummary() {
  try {
    const result = await db
      .select({
        namaSampah: jenisSampah.namaSampah,
        totalKg: sql<string>`SUM(${sampahKelas.jumlahKg})`,
        totalNilai: sql<string>`SUM(${sampahKelas.jumlahKg} * ${jenisSampah.hargaPerKg})`,
      })
      .from(sampahKelas)
      .leftJoin(jenisSampah, eq(jenisSampah.id, sampahKelas.jenisSampahId))
      .groupBy(jenisSampah.namaSampah)
      .orderBy(desc(sql<string>`SUM(${sampahKelas.jumlahKg})`));

    return { data: result };
  } catch (error) {
    return { error: "Failed to fetch waste type summary" };
  }
}
