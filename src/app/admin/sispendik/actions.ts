'use server';

import { db } from '@/lib/db';
import {
    kelas,
    jenisSampah,
    sampahKelas,
    guruSispendik,
    setoranGuru,
    setoranMasyarakat,
} from '@/lib/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function ensureKelasSeeded() {
    const any = await db.select({ id: kelas.id }).from(kelas).limit(1);
    if (any.length === 0) {
        const kelasData = [] as { tingkat: number; huruf: string }[];
        for (const tingkat of [7, 8, 9]) {
            for (const huruf of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
                kelasData.push({ tingkat, huruf });
            }
        }
        await db.insert(kelas).values(kelasData);
    }
}

// Kelas Actions
export async function getAllKelas() {
    try {
        await ensureKelasSeeded();
        const data = await db
            .select()
            .from(kelas)
            .orderBy(kelas.tingkat, kelas.huruf);
        return { data };
    } catch (error) {
        return { error: 'Failed to fetch kelas data' };
    }
}

// Jenis Sampah Actions
export async function getAllJenisSampah() {
    try {
        const data = await db
            .select()
            .from(jenisSampah)
            .orderBy(jenisSampah.namaSampah);
        return { data };
    } catch (error) {
        return { error: 'Failed to fetch jenis sampah data' };
    }
}

// Guru Actions
export async function getAllGurus() {
	try {
		const data = await db
			.select()
			.from(guruSispendik)
			.orderBy(guruSispendik.namaGuru);
		return { data };
	} catch (error) {
		return { error: 'Failed to fetch guru data' };
	}
}

export async function createJenisSampah(data: {
    namaSampah: string;
    hargaPerKg: number;
    kategori: 'organik' | 'anorganik';
}) {
    if (!data.namaSampah.trim() || !Number.isFinite(data.hargaPerKg) || data.hargaPerKg < 0) {
        return { error: 'Nama dan harga sampah tidak valid' };
    }
    try {
        const newJenis = await db
            .insert(jenisSampah)
            .values({
                namaSampah: data.namaSampah.trim(),
                kategori: data.kategori,
                hargaPerKg: String(data.hargaPerKg),
            })
            .returning();
        revalidatePath('/admin/sispendik');
        return { success: true, data: newJenis[0] };
    } catch (error) {
        return { error: 'Failed to create jenis sampah' };
    }
}

export async function updateJenisSampah(
    id: number,
    data: {
        namaSampah: string;
        hargaPerKg: number;
        kategori: 'organik' | 'anorganik';
    },
) {
    if (!data.namaSampah.trim() || !Number.isFinite(data.hargaPerKg) || data.hargaPerKg < 0) {
        return { error: 'Nama dan harga sampah tidak valid' };
    }
    try {
        const updatedJenis = await db
            .update(jenisSampah)
            .set({
                namaSampah: data.namaSampah.trim(),
                kategori: data.kategori,
                hargaPerKg: String(data.hargaPerKg),
                updatedAt: new Date(),
            })
            .where(eq(jenisSampah.id, id))
            .returning();
        revalidatePath('/admin/sispendik');
        return { success: true, data: updatedJenis[0] };
    } catch (error) {
        return { error: 'Failed to update jenis sampah' };
    }
}

export async function deleteJenisSampah(id: number) {
    try {
        const [setoranKelas, setoranGuruData, setoranMasyarakatData] = await Promise.all([
            db.select({ id: sampahKelas.id }).from(sampahKelas).where(eq(sampahKelas.jenisSampahId, id)).limit(1),
            db.select({ id: setoranGuru.id }).from(setoranGuru).where(eq(setoranGuru.jenisSampahId, id)).limit(1),
            db.select({ id: setoranMasyarakat.id }).from(setoranMasyarakat).where(eq(setoranMasyarakat.jenisSampahId, id)).limit(1),
        ]);
        if (setoranKelas.length || setoranGuruData.length || setoranMasyarakatData.length) {
            return { error: 'Jenis sampah sudah dipakai pada setoran dan tidak boleh dihapus.' };
        }
        await db.delete(jenisSampah).where(eq(jenisSampah.id, id));
        revalidatePath('/admin/sispendik');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete jenis sampah' };
    }
}

export async function resetClassDeposits(kelasId: number) {
    try {
        await db.delete(sampahKelas).where(eq(sampahKelas.kelasId, kelasId));
        revalidatePath('/admin/sispendik');
        revalidatePath('/sispendik');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to reset class deposits' };
    }
}

export async function resetClassDepositsByMonth(
    kelasId: number,
    month: number,
    year: number,
) {
    try {
        await db
            .delete(sampahKelas)
            .where(
                and(
                    eq(sampahKelas.kelasId, kelasId),
                    sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`,
                ),
            );
        revalidatePath('/admin/sispendik');
        revalidatePath('/sispendik');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to reset class deposits for month' };
    }
}

export async function deleteSampahKelasRecord(id: number) {
    try {
        await db.delete(sampahKelas).where(eq(sampahKelas.id, id));
        revalidatePath('/admin/sispendik');
        revalidatePath('/sispendik');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete sampah kelas record' };
    }
}

// Sampah Kelas Actions
export async function createSampahKelas(data: {
    kelasId: number;
    jenisSampahId: number;
    jumlahKg: number;
    createdAt: Date;
}) {
    if (!Number.isFinite(data.jumlahKg) || data.jumlahKg <= 0 || Number.isNaN(data.createdAt.getTime())) {
        return { error: 'Jumlah atau tanggal setoran tidak valid' };
    }
    try {
        const [jenis] = await db
            .select({ hargaPerKg: jenisSampah.hargaPerKg })
            .from(jenisSampah)
            .where(eq(jenisSampah.id, data.jenisSampahId))
            .limit(1);
        if (!jenis) return { error: 'Jenis sampah tidak ditemukan' };
        await db.insert(sampahKelas).values({
            kelasId: data.kelasId,
            jenisSampahId: data.jenisSampahId,
            jumlahKg: String(data.jumlahKg),
            hargaPerKgSnapshot: jenis.hargaPerKg,
            tanggalSetoran: data.createdAt,
        });
        revalidatePath('/admin/sispendik');
        revalidatePath('/sispendik');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create sampah kelas record' };
    }
}

export async function updateSampahKelas(
    id: number,
    data: { jenisSampahId: number; jumlahKg: number },
) {
    if (!Number.isFinite(data.jumlahKg) || data.jumlahKg <= 0) {
        return { error: 'Jumlah setoran tidak valid' };
    }
    try {
        const [existing] = await db
            .select({ jenisSampahId: sampahKelas.jenisSampahId })
            .from(sampahKelas)
            .where(eq(sampahKelas.id, id))
            .limit(1);
        if (!existing) return { error: 'Setoran tidak ditemukan' };
        const updateData: {
            jenisSampahId: number;
            jumlahKg: string;
            hargaPerKgSnapshot?: string;
        } = {
            jenisSampahId: data.jenisSampahId,
            jumlahKg: String(data.jumlahKg),
        };
        if (existing.jenisSampahId !== data.jenisSampahId) {
            const [jenis] = await db
                .select({ hargaPerKg: jenisSampah.hargaPerKg })
                .from(jenisSampah)
                .where(eq(jenisSampah.id, data.jenisSampahId))
                .limit(1);
            if (!jenis) return { error: 'Jenis sampah tidak ditemukan' };
            updateData.hargaPerKgSnapshot = jenis.hargaPerKg;
        }
        await db
            .update(sampahKelas)
            .set(updateData)
            .where(eq(sampahKelas.id, id));
        revalidatePath('/admin/sispendik');
        revalidatePath('/sispendik');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update sampah kelas record' };
    }
}

export async function getSampahKelasByKelas(kelasId: number) {
    try {
        const data = await db
            .select({
                id: sampahKelas.id,
                jumlahKg: sampahKelas.jumlahKg,
                jenisSampah: jenisSampah.namaSampah,
                hargaPerKg: sampahKelas.hargaPerKgSnapshot,
                createdAt: sampahKelas.tanggalSetoran,
            })
            .from(sampahKelas)
            .innerJoin(
                jenisSampah,
                eq(sampahKelas.jenisSampahId, jenisSampah.id),
            )
            .where(eq(sampahKelas.kelasId, kelasId))
            .orderBy(desc(sampahKelas.tanggalSetoran));
        return { data };
    } catch (error) {
        return { error: 'Failed to fetch sampah kelas data' };
    }
}

export async function getSampahKelasByKelasMonth(
    kelasId: number,
    month: number,
    year: number,
) {
    try {
        const data = await db
            .select({
                id: sampahKelas.id,
                jumlahKg: sampahKelas.jumlahKg,
                jenisSampah: jenisSampah.namaSampah,
                jenisSampahId: jenisSampah.id,
                hargaPerKg: sampahKelas.hargaPerKgSnapshot,
                createdAt: sampahKelas.tanggalSetoran,
            })
            .from(sampahKelas)
            .innerJoin(
                jenisSampah,
                eq(sampahKelas.jenisSampahId, jenisSampah.id),
            )
            .where(
                and(
                    eq(sampahKelas.kelasId, kelasId),
                    sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`,
                ),
            )
            .orderBy(desc(sampahKelas.tanggalSetoran));
        return { data };
    } catch (error) {
        return { error: 'Failed to fetch sampah kelas data (filtered)' };
    }
}

// Dashboard Data Actions
export type AggregatedData = {
    wasteType: string;
    amount: number;
    month: string;
    year: number;
};

export async function getAggregatedData(month: number, year: number) {
    try {
        const data = await db
            .select({
                wasteType: jenisSampah.namaSampah,
                amount: sql<number>`SUM(${sampahKelas.jumlahKg})`,
                month: sql<string>`TO_CHAR(${sampahKelas.tanggalSetoran}, 'Month')`,
                year: sql<number>`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran})`,
            })
            .from(sampahKelas)
            .innerJoin(
                jenisSampah,
                eq(sampahKelas.jenisSampahId, jenisSampah.id),
            )
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`,
                ),
            )
            .groupBy(
                jenisSampah.namaSampah,
                sql`TO_CHAR(${sampahKelas.tanggalSetoran}, 'Month')`,
                sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran})`,
            );
        return { data };
    } catch (error) {
        return { error: 'Failed to fetch aggregated data' };
    }
}

export async function getClassRanking(month: number, year: number) {
    try {
        const data = await db
            .select({
                className: sql<string>`CONCAT(${kelas.tingkat}, ${kelas.huruf})`,
                total: sql<number>`SUM(${sampahKelas.jumlahKg})`,
                totalValue: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric) * CAST(${sampahKelas.hargaPerKgSnapshot} AS numeric)), 0)`,
                jenisList: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
            })
            .from(sampahKelas)
            .innerJoin(kelas, eq(sampahKelas.kelasId, kelas.id))
            .innerJoin(jenisSampah, eq(sampahKelas.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`,
                ),
            )
            .groupBy(kelas.tingkat, kelas.huruf)
            .orderBy(desc(sql<number>`SUM(${sampahKelas.jumlahKg})`));
        return { data };
    } catch (error) {
        return { error: 'Failed to fetch class ranking' };
    }
}

export async function getClassTotals(month: number, year: number) {
    try {
        await ensureKelasSeeded();
        // Left join kelas with sampah_kelas and jenis_sampah to get totals per class.
        // Apply month/year filter in the JOIN condition to preserve classes without data.
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
            .leftJoin(
                jenisSampah,
                eq(sampahKelas.jenisSampahId, jenisSampah.id),
            )
            .groupBy(kelas.id, kelas.tingkat, kelas.huruf)
            .orderBy(kelas.tingkat, kelas.huruf);

        return { data };
    } catch (error) {
        return { error: 'Failed to fetch class totals' };
    }
}

export async function getTotalsSummary(month: number, year: number) {
    try {
        // Get student deposits
        const studentDeposits = await db
            .select({
                jumlahKg: sampahKelas.jumlahKg,
                hargaPerKg: sampahKelas.hargaPerKgSnapshot,
            })
            .from(sampahKelas)
            .innerJoin(jenisSampah, eq(sampahKelas.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`,
                ),
            );

        // Get teacher deposits
        const teacherDeposits = await db
            .select({
                jumlahKg: setoranGuru.jumlahKg,
                hargaPerKg: setoranGuru.hargaPerKgSnapshot,
            })
            .from(setoranGuru)
            .innerJoin(jenisSampah, eq(setoranGuru.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${setoranGuru.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranGuru.tanggalSetoran}) = ${year}`,
                ),
            );

        const communityDeposits = await db
            .select({
                jumlahKg: setoranMasyarakat.jumlahKg,
                hargaPerKg: setoranMasyarakat.hargaPerKgSnapshot,
            })
            .from(setoranMasyarakat)
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${setoranMasyarakat.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranMasyarakat.tanggalSetoran}) = ${year}`,
                ),
            );

        const allDeposits = [
            ...studentDeposits,
            ...teacherDeposits,
            ...communityDeposits,
        ];

        const totalKg = allDeposits.reduce((acc, row) => acc + Number(row.jumlahKg), 0);
        const totalValue = allDeposits.reduce((acc, row) => acc + (Number(row.jumlahKg) * Number(row.hargaPerKg)), 0);

        return { data: { totalKg, totalValue } };

    } catch (error) {
        console.error("Error in getTotalsSummary:", error);
        return { error: 'Failed to fetch totals summary' };
    }
}

export async function getTopWasteTypes(month: number, year: number) {
    try {
        // Get student waste
        const studentWaste = await db
            .select({
                wasteType: jenisSampah.namaSampah,
                category: jenisSampah.kategori,
                jumlahKg: sampahKelas.jumlahKg,
            })
            .from(sampahKelas)
            .innerJoin(jenisSampah, eq(sampahKelas.jenisSampahId, jenisSampah.id))
            .where(and(
                sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran}) = ${month}`,
                sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`
            ));

        // Get teacher waste
        const teacherWaste = await db
            .select({
                wasteType: jenisSampah.namaSampah,
                category: jenisSampah.kategori,
                jumlahKg: setoranGuru.jumlahKg,
            })
            .from(setoranGuru)
            .innerJoin(jenisSampah, eq(setoranGuru.jenisSampahId, jenisSampah.id))
            .where(and(
                sql`EXTRACT(MONTH FROM ${setoranGuru.tanggalSetoran}) = ${month}`,
                sql`EXTRACT(YEAR FROM ${setoranGuru.tanggalSetoran}) = ${year}`
            ));

        const communityWaste = await db
            .select({
                wasteType: jenisSampah.namaSampah,
                category: jenisSampah.kategori,
                jumlahKg: setoranMasyarakat.jumlahKg,
            })
            .from(setoranMasyarakat)
            .innerJoin(
                jenisSampah,
                eq(setoranMasyarakat.jenisSampahId, jenisSampah.id),
            )
            .where(and(
                sql`EXTRACT(MONTH FROM ${setoranMasyarakat.tanggalSetoran}) = ${month}`,
                sql`EXTRACT(YEAR FROM ${setoranMasyarakat.tanggalSetoran}) = ${year}`,
            ));

        const allWaste = [...studentWaste, ...teacherWaste, ...communityWaste];

        const aggregated = allWaste.reduce((acc, row) => {
            const existing = acc.get(row.wasteType);
            const amount = Number(row.jumlahKg);
            if (existing) {
                existing.totalKg += amount;
            } else {
                acc.set(row.wasteType, {
                    wasteType: row.wasteType,
                    totalKg: amount,
                    category: row.category,
                });
            }
            return acc;
        }, new Map<string, { wasteType: string; totalKg: number; category?: string }>());

        const sorted = Array.from(aggregated.values())
            .sort((a, b) => b.totalKg - a.totalKg)
            .slice(0, 3);

        const finalData = sorted.map(s => ({ ...s, totalValue: 0, category: s.category }));

        return { data: finalData };

    } catch (error) {
        console.error("Error in getTopWasteTypes:", error);
        return { error: 'Failed to fetch top waste types' };
    }
}

export async function getMasyarakatTotals(month: number, year: number) {
    try {
        const data = await db
            .select({
                wasteType: jenisSampah.namaSampah,
                category: jenisSampah.kategori,
                totalKg: sql<number>`COALESCE(SUM(${setoranMasyarakat.jumlahKg}), 0)`,
            })
            .from(setoranMasyarakat)
            .innerJoin(
                jenisSampah,
                eq(setoranMasyarakat.jenisSampahId, jenisSampah.id),
            )
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${setoranMasyarakat.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranMasyarakat.tanggalSetoran}) = ${year}`,
                ),
            )
            .groupBy(jenisSampah.namaSampah, jenisSampah.kategori)
            .orderBy(desc(sql<number>`SUM(${setoranMasyarakat.jumlahKg})`));

        return { data };
    } catch (error) {
        console.error('Error in getMasyarakatTotals:', error);
        return { error: 'Failed to fetch masyarakat totals' };
    }
}

export async function getGuruRanking(month: number, year: number) {
    try {
        const data = await db
            .select({
                guruName: guruSispendik.namaGuru,
                totalKg: sql<number>`COALESCE(SUM(${setoranGuru.jumlahKg}), 0)`,
                wasteTypes: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
                categories: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.kategori}, ', ')`,
            })
            .from(setoranGuru)
            .innerJoin(guruSispendik, eq(setoranGuru.guruId, guruSispendik.id))
            .innerJoin(jenisSampah, eq(setoranGuru.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${setoranGuru.tanggalSetoran}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranGuru.tanggalSetoran}) = ${year}`,
                ),
            )
            .groupBy(guruSispendik.namaGuru)
            .orderBy(desc(sql<number>`SUM(${setoranGuru.jumlahKg})`));
        return { data };
    } catch (error) {
        console.error("Error fetching guru ranking:", error);
        return { error: 'Failed to fetch guru ranking' };
    }
}

export async function initializeKelasData() {
    try {
        const kelasData = [] as { tingkat: number; huruf: string }[];
        for (const tingkat of [7, 8, 9]) {
            for (const huruf of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
                kelasData.push({ tingkat, huruf });
            }
        }
        await db.insert(kelas).values(kelasData);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to initialize kelas data' };
    }
}

export type LaporanBulanan = {
    month: number;
    totalKg: number;
    totalValue: number;
};

/** Rekap seluruh sumber setoran: kelas, guru, dan masyarakat. */
export async function getLaporanPerolehanTahunan(year: number) {
    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
        return { error: 'Tahun laporan tidak valid.' };
    }

    try {
        const [kelasData, guruData, masyarakatData] = await Promise.all([
            db
                .select({
                    month: sql<number>`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})`,
                    totalKg: sql<string>`SUM(${sampahKelas.jumlahKg})`,
                    totalValue: sql<string>`SUM(${sampahKelas.jumlahKg} * ${sampahKelas.hargaPerKgSnapshot})`,
                })
                .from(sampahKelas)
                .where(sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`)
                .groupBy(sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})`),
            db
                .select({
                    month: sql<number>`EXTRACT(MONTH FROM ${setoranGuru.tanggalSetoran})`,
                    totalKg: sql<string>`SUM(${setoranGuru.jumlahKg})`,
                    totalValue: sql<string>`SUM(${setoranGuru.jumlahKg} * ${setoranGuru.hargaPerKgSnapshot})`,
                })
                .from(setoranGuru)
                .where(sql`EXTRACT(YEAR FROM ${setoranGuru.tanggalSetoran}) = ${year}`)
                .groupBy(sql`EXTRACT(MONTH FROM ${setoranGuru.tanggalSetoran})`),
            db
                .select({
                    month: sql<number>`EXTRACT(MONTH FROM ${setoranMasyarakat.tanggalSetoran})`,
                    totalKg: sql<string>`SUM(${setoranMasyarakat.jumlahKg})`,
                    totalValue: sql<string>`SUM(${setoranMasyarakat.jumlahKg} * ${setoranMasyarakat.hargaPerKgSnapshot})`,
                })
                .from(setoranMasyarakat)
                .where(sql`EXTRACT(YEAR FROM ${setoranMasyarakat.tanggalSetoran}) = ${year}`)
                .groupBy(sql`EXTRACT(MONTH FROM ${setoranMasyarakat.tanggalSetoran})`),
        ]);

        const months: LaporanBulanan[] = Array.from({ length: 12 }, (_, index) => ({
            month: index + 1,
            totalKg: 0,
            totalValue: 0,
        }));
        for (const row of [...kelasData, ...guruData, ...masyarakatData]) {
            const target = months[Number(row.month) - 1];
            if (!target) continue;
            target.totalKg += Number(row.totalKg || 0);
            target.totalValue += Number(row.totalValue || 0);
        }

        return {
            data: {
                months,
                totalKg: months.reduce((total, item) => total + item.totalKg, 0),
                totalValue: months.reduce((total, item) => total + item.totalValue, 0),
            },
        };
    } catch {
        return { error: 'Gagal membuat laporan perolehan. Pastikan migrasi SISPENDIG sudah dijalankan.' };
    }
}

/** Matriks 12 bulan yang selalu memuat kelas 7A–9H secara berurutan. */
export async function getPerkembanganSampahKelas(year: number) {
    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
        return { error: 'Tahun laporan tidak valid.' };
    }

    try {
        const kelasResponse = await getAllKelas();
        if (!kelasResponse.data) return { error: kelasResponse.error || 'Gagal memuat kelas.' };
        const totals = await db
            .select({
                kelasId: sampahKelas.kelasId,
                month: sql<number>`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})`,
                totalKg: sql<string>`SUM(${sampahKelas.jumlahKg})`,
            })
            .from(sampahKelas)
            .where(sql`EXTRACT(YEAR FROM ${sampahKelas.tanggalSetoran}) = ${year}`)
            .groupBy(
                sampahKelas.kelasId,
                sql`EXTRACT(MONTH FROM ${sampahKelas.tanggalSetoran})`,
            );

        const byClassMonth = new Map(
            totals.map((item) => [`${item.kelasId}-${item.month}`, Number(item.totalKg || 0)]),
        );
        const data = kelasResponse.data.map((item) => ({
            kelasId: item.id,
            kelas: `${item.tingkat}${item.huruf}`,
            tingkat: item.tingkat,
            months: Array.from(
                { length: 12 },
                (_, index) => byClassMonth.get(`${item.id}-${index + 1}`) || 0,
            ),
        }));
        return { data };
    } catch {
        return { error: 'Gagal membuat perkembangan sampah per kelas.' };
    }
}
