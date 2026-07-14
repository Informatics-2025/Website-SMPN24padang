'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { jenisSampah, setoranMasyarakat } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

const setoranMasyarakatSchema = z.object({
    namaPenyetor: z.string().trim().min(2, 'Nama penyetor minimal 2 karakter'),
    jenisSampahId: z.coerce.number().int().positive(),
    jumlahKg: z.coerce.number().positive('Jumlah harus lebih dari 0'),
    tanggalSetoran: z.coerce.date(),
});

function revalidateSispendik() {
    revalidatePath('/admin/sispendik');
    revalidatePath('/sispendik');
}

export async function getSetoranMasyarakat(month: number, year: number) {
    try {
        const data = await db
            .select({
                id: setoranMasyarakat.id,
                namaPenyetor: setoranMasyarakat.namaPenyetor,
                jenisSampahId: setoranMasyarakat.jenisSampahId,
                jenisSampah: jenisSampah.namaSampah,
                kategori: jenisSampah.kategori,
                jumlahKg: setoranMasyarakat.jumlahKg,
                hargaPerKg: setoranMasyarakat.hargaPerKgSnapshot,
                tanggalSetoran: setoranMasyarakat.tanggalSetoran,
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
            .orderBy(desc(setoranMasyarakat.tanggalSetoran));
        return { data };
    } catch {
        return { error: 'Gagal mengambil setoran masyarakat. Pastikan migrasi SISPENDIG sudah dijalankan.' };
    }
}

export async function createSetoranMasyarakat(input: unknown) {
    const parsed = setoranMasyarakatSchema.safeParse(input);
    if (!parsed.success) {
        return { error: 'Data setoran masyarakat tidak valid.' };
    }

    try {
        const [jenis] = await db
            .select({ hargaPerKg: jenisSampah.hargaPerKg })
            .from(jenisSampah)
            .where(eq(jenisSampah.id, parsed.data.jenisSampahId))
            .limit(1);
        if (!jenis) return { error: 'Jenis sampah tidak ditemukan.' };

        const [data] = await db
            .insert(setoranMasyarakat)
            .values({
                ...parsed.data,
                jumlahKg: String(parsed.data.jumlahKg),
                hargaPerKgSnapshot: jenis.hargaPerKg,
            })
            .returning();
        revalidateSispendik();
        return { success: true, data };
    } catch {
        return { error: 'Gagal menyimpan setoran masyarakat.' };
    }
}

export async function updateSetoranMasyarakat(id: number, input: unknown) {
    const parsed = setoranMasyarakatSchema.safeParse(input);
    if (!Number.isInteger(id) || id < 1 || !parsed.success) {
        return { error: 'Data setoran masyarakat tidak valid.' };
    }

    try {
        const [existing] = await db
            .select({ jenisSampahId: setoranMasyarakat.jenisSampahId })
            .from(setoranMasyarakat)
            .where(eq(setoranMasyarakat.id, id))
            .limit(1);
        if (!existing) return { error: 'Setoran tidak ditemukan.' };

        const updateData: {
            namaPenyetor: string;
            jenisSampahId: number;
            jumlahKg: string;
            tanggalSetoran: Date;
            updatedAt: Date;
            hargaPerKgSnapshot?: string;
        } = {
            ...parsed.data,
            jumlahKg: String(parsed.data.jumlahKg),
            updatedAt: new Date(),
        };

        if (existing.jenisSampahId !== parsed.data.jenisSampahId) {
            const [jenis] = await db
                .select({ hargaPerKg: jenisSampah.hargaPerKg })
                .from(jenisSampah)
                .where(eq(jenisSampah.id, parsed.data.jenisSampahId))
                .limit(1);
            if (!jenis) return { error: 'Jenis sampah tidak ditemukan.' };
            updateData.hargaPerKgSnapshot = jenis.hargaPerKg;
        }

        await db
            .update(setoranMasyarakat)
            .set(updateData)
            .where(eq(setoranMasyarakat.id, id));
        revalidateSispendik();
        return { success: true };
    } catch {
        return { error: 'Gagal memperbarui setoran masyarakat.' };
    }
}

export async function deleteSetoranMasyarakat(id: number) {
    if (!Number.isInteger(id) || id < 1) return { error: 'ID setoran tidak valid.' };
    try {
        await db.delete(setoranMasyarakat).where(eq(setoranMasyarakat.id, id));
        revalidateSispendik();
        return { success: true };
    } catch {
        return { error: 'Gagal menghapus setoran masyarakat.' };
    }
}
