'use server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { setoranGuru, guruSispendik, jenisSampah } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
    id: z.number(),
    guruId: z.coerce.number().min(1, 'Guru harus dipilih'),
    jenisSampahId: z.coerce.number().min(1, 'Jenis sampah harus dipilih'),
    jumlahKg: z.coerce.number().gt(0, 'Jumlah (kg) harus lebih dari 0'),
    createdAt: z.coerce.date(),
});

const CreateSetoranGuru = FormSchema.omit({ id: true });
const UpdateSetoranGuru = FormSchema.omit({ id: true, guruId: true });

export type State = {
    errors?: {
        guruId?: string[];
        jenisSampahId?: string[];
        jumlahKg?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function createSetoranGuru(
    prevState: State,
    formData: FormData,
): Promise<State> {
    const validatedFields = CreateSetoranGuru.safeParse({
        guruId: formData.get('guruId'),
        jenisSampahId: formData.get('jenisSampahId'),
        jumlahKg: formData.get('jumlahKg'),
        createdAt: formData.get('createdAt'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Gagal membuat setoran. Mohon periksa isian Anda.',
            success: false,
        };
    }

    try {
        await db.insert(setoranGuru).values({
            guruId: validatedFields.data.guruId,
            jenisSampahId: validatedFields.data.jenisSampahId,
            jumlahKg: String(validatedFields.data.jumlahKg), // Konversi ke string
            createdAt: validatedFields.data.createdAt,
        });
    } catch (error) {
        return {
            message: 'Gagal menyimpan ke database.',
            success: false,
        };
    }

    revalidatePath('/admin/sispendik');
    return {
        message: `Berhasil membuat setoran baru.`,
        success: true,
    };
}

export async function updateSetoranGuru(
    id: number,
    data: { jenisSampahId: number; jumlahKg: number },
): Promise<State> {
    const validatedFields = UpdateSetoranGuru.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Gagal memperbarui setoran. Mohon periksa isian Anda.',
            success: false,
        };
    }

    try {
        await db
            .update(setoranGuru)
            .set({
                jenisSampahId: validatedFields.data.jenisSampahId,
                jumlahKg: String(validatedFields.data.jumlahKg),
            })
            .where(eq(setoranGuru.id, id));
    } catch (error) {
        return {
            message: 'Gagal memperbarui di database.',
            success: false,
        };
    }

    revalidatePath('/admin/sispendik');
    return {
        message: `Berhasil memperbarui setoran.`,
        success: true,
    };
}

export async function deleteSetoranGuru(id: number) {
    try {
        await db.delete(setoranGuru).where(eq(setoranGuru.id, id));
        revalidatePath('/admin/sispendik');
        return { success: true, message: 'Berhasil menghapus data setoran.' };
    } catch (error) {
        return {
            success: false,
            message: 'Gagal menghapus data dari database.',
        };
    }
}

export async function getSetoranGuru(month: number, year: number) {
    try {
        const data = await db
            .select({
                id: setoranGuru.id,
                guruId: setoranGuru.guruId,
                jumlahKg: setoranGuru.jumlahKg,
                createdAt: setoranGuru.createdAt,
                guru: guruSispendik.namaGuru,
                jenisSampahId: jenisSampah.id,
                jenisSampah: jenisSampah.namaSampah,
                hargaPerKg: jenisSampah.hargaPerKg,
            })
            .from(setoranGuru)
            .leftJoin(guruSispendik, eq(setoranGuru.guruId, guruSispendik.id))
            .leftJoin(
                jenisSampah,
                eq(setoranGuru.jenisSampahId, jenisSampah.id),
            )
            .where(
                and(
                    sql`EXTRACT(MONTH FROM ${setoranGuru.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranGuru.createdAt}) = ${year}`,
                ),
            )
            .orderBy(desc(setoranGuru.createdAt));

        return { data };
    } catch (error) {
        console.error('Database Error:', error);
        return { error: 'Gagal mengambil data setoran guru.' };
    }
}

export async function getSetoranGuruByGuru(
    guruId: number,
    month: number,
    year: number,
) {
    try {
        const data = await db
            .select({
                id: setoranGuru.id,
                guruId: setoranGuru.guruId,
                jumlahKg: setoranGuru.jumlahKg,
                createdAt: setoranGuru.createdAt,
                guru: guruSispendik.namaGuru,
                jenisSampahId: setoranGuru.jenisSampahId,
                jenisSampah: jenisSampah.namaSampah,
                hargaPerKg: jenisSampah.hargaPerKg,
            })
            .from(setoranGuru)
            .leftJoin(guruSispendik, eq(setoranGuru.guruId, guruSispendik.id))
            .leftJoin(
                jenisSampah,
                eq(setoranGuru.jenisSampahId, jenisSampah.id),
            )
            .where(
                and(
                    eq(setoranGuru.guruId, guruId),
                    sql`EXTRACT(MONTH FROM ${setoranGuru.createdAt}) = ${month}`,
                    sql`EXTRACT(YEAR FROM ${setoranGuru.createdAt}) = ${year}`,
                ),
            )
            .orderBy(desc(setoranGuru.createdAt));

        return { data };
    } catch (error) {
        console.error('Database Error:', error);
        return { error: 'Gagal mengambil data setoran guru.' };
    }
}
