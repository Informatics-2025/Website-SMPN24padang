'use server';

import { db } from '@/lib/db';
import { kelas, jenisSampah, sampahKelas, guruSispendik, setoranGuru } from '@/lib/db/schema';
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
}) {
    try {
        const newJenis = await db
            .insert(jenisSampah)
            .values({
                namaSampah: data.namaSampah,
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
    },
) {
    try {
        const updatedJenis = await db
            .update(jenisSampah)
            .set({
                namaSampah: data.namaSampah,
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
                    sql`EXTRACT(MONTH FROM ${sampahKelas.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt}) = ${year}`,
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
    try {
        await db.insert(sampahKelas).values({
            kelasId: data.kelasId,
            jenisSampahId: data.jenisSampahId,
            jumlahKg: String(data.jumlahKg),
            createdAt: data.createdAt,
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
    try {
        await db
            .update(sampahKelas)
            .set({
                jenisSampahId: data.jenisSampahId,
                jumlahKg: String(data.jumlahKg),
            })
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
                hargaPerKg: jenisSampah.hargaPerKg,
                createdAt: sampahKelas.createdAt,
            })
            .from(sampahKelas)
            .innerJoin(
                jenisSampah,
                eq(sampahKelas.jenisSampahId, jenisSampah.id),
            )
            .where(eq(sampahKelas.kelasId, kelasId))
            .orderBy(desc(sampahKelas.createdAt));
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
                hargaPerKg: jenisSampah.hargaPerKg,
                createdAt: sampahKelas.createdAt,
            })
            .from(sampahKelas)
            .innerJoin(
                jenisSampah,
                eq(sampahKelas.jenisSampahId, jenisSampah.id),
            )
            .where(
                and(
                    eq(sampahKelas.kelasId, kelasId),
                    sql`EXTRACT(MONTH FROM ${sampahKelas.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt}) = ${year}`,
                ),
            )
            .orderBy(desc(sampahKelas.createdAt));
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
                month: sql<string>`TO_CHAR(${sampahKelas.createdAt}, 'Month')`,
                year: sql<number>`EXTRACT(YEAR FROM ${sampahKelas.createdAt})`,
            })
            .from(sampahKelas)
            .innerJoin(
                jenisSampah,
                eq(sampahKelas.jenisSampahId, jenisSampah.id),
            )
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${sampahKelas.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt}) = ${year}`,
                ),
            )
            .groupBy(
                jenisSampah.namaSampah,
                sql`TO_CHAR(${sampahKelas.createdAt}, 'Month')`,
                sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt})`,
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
                totalValue: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric) * CAST(${jenisSampah.hargaPerKg} AS numeric)), 0)`,
                jenisList: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
            })
            .from(sampahKelas)
            .innerJoin(kelas, eq(sampahKelas.kelasId, kelas.id))
            .innerJoin(jenisSampah, eq(sampahKelas.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${sampahKelas.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt}) = ${year}`,
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
                tingkat: kelas.tingkat,
                huruf: kelas.huruf,
                total: sql<number>`COALESCE(SUM(${sampahKelas.jumlahKg}), 0)`,
                totalValue: sql<number>`COALESCE(SUM(CAST(${sampahKelas.jumlahKg} AS numeric) * CAST(${jenisSampah.hargaPerKg} AS numeric)), 0)`,
                jenisList: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`,
            })
            .from(kelas)
            .leftJoin(
                sampahKelas,
                and(
                    eq(sampahKelas.kelasId, kelas.id),
                    sql`EXTRACT(MONTH FROM ${sampahKelas.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt}) = ${year}`,
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
                hargaPerKg: jenisSampah.hargaPerKg,
            })
            .from(sampahKelas)
            .innerJoin(jenisSampah, eq(sampahKelas.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${sampahKelas.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt}) = ${year}`,
                ),
            );

        // Get teacher deposits
        const teacherDeposits = await db
            .select({
                jumlahKg: setoranGuru.jumlahKg,
                hargaPerKg: jenisSampah.hargaPerKg,
            })
            .from(setoranGuru)
            .innerJoin(jenisSampah, eq(setoranGuru.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${setoranGuru.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranGuru.createdAt}) = ${year}`,
                ),
            );

        const allDeposits = [...studentDeposits, ...teacherDeposits];

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
                jumlahKg: sampahKelas.jumlahKg,
            })
            .from(sampahKelas)
            .innerJoin(jenisSampah, eq(sampahKelas.jenisSampahId, jenisSampah.id))
            .where(and(
                sql`EXTRACT(MONTH FROM ${sampahKelas.createdAt}) = ${month}`,
                sql`EXTRACT(YEAR FROM ${sampahKelas.createdAt}) = ${year}`
            ));

        // Get teacher waste
        const teacherWaste = await db
            .select({
                wasteType: jenisSampah.namaSampah,
                jumlahKg: setoranGuru.jumlahKg,
            })
            .from(setoranGuru)
            .innerJoin(jenisSampah, eq(setoranGuru.jenisSampahId, jenisSampah.id))
            .where(and(
                sql`EXTRACT(MONTH FROM ${setoranGuru.createdAt}) = ${month}`,
                sql`EXTRACT(YEAR FROM ${setoranGuru.createdAt}) = ${year}`
            ));

        const allWaste = [...studentWaste, ...teacherWaste];

        const aggregated = allWaste.reduce((acc, row) => {
            const existing = acc.get(row.wasteType);
            const amount = Number(row.jumlahKg);
            if (existing) {
                existing.totalKg += amount;
            } else {
                acc.set(row.wasteType, { wasteType: row.wasteType, totalKg: amount });
            }
            return acc;
        }, new Map<string, { wasteType: string, totalKg: number }>());

        const sorted = Array.from(aggregated.values())
            .sort((a, b) => b.totalKg - a.totalKg)
            .slice(0, 3);

        const finalData = sorted.map(s => ({ ...s, totalValue: 0 }));

        return { data: finalData };

    } catch (error) {
        console.error("Error in getTopWasteTypes:", error);
        return { error: 'Failed to fetch top waste types' };
    }
}

export async function getGuruRanking(month: number, year: number) {
    try {
        const data = await db
            .select({
                guruName: guruSispendik.namaGuru,
                totalKg: sql<number>`COALESCE(SUM(${setoranGuru.jumlahKg}), 0)`,
                wasteTypes: sql<string>`STRING_AGG(DISTINCT ${jenisSampah.namaSampah}, ', ')`
            })
            .from(setoranGuru)
            .innerJoin(guruSispendik, eq(setoranGuru.guruId, guruSispendik.id))
            .innerJoin(jenisSampah, eq(setoranGuru.jenisSampahId, jenisSampah.id))
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${setoranGuru.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranGuru.createdAt}) = ${year}`,
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
