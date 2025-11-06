'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { profiles, pastPrincipals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/lib/supabase-storage';

const profileSchema = z.object({
    principalName: z.string().min(1, 'Nama tidak boleh kosong'),
    principalWelcome: z.string().min(1, 'Sambutan tidak boleh kosong'),
    history: z.string().min(1, 'Sejarah tidak boleh kosong'),
    principalImage: z.instanceof(File).optional(),
});

export async function updatePrincipalProfile(formData: FormData) {
    const validatedFields = profileSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { principalName, principalWelcome, history, principalImage } =
        validatedFields.data;

    const existingProfile = await db.query.profiles.findFirst();
    const profileId = existingProfile?.id || '1';

    let newImageUrl: string | null | undefined;

    const oldImageUrl = existingProfile?.principalImageUrl;

    if (principalImage && principalImage.size > 0) {
        try {
            newImageUrl = await uploadImageToSupabase(principalImage, 'profile/principal');
        } catch (error) {
            return { success: false, message: `Gagal unggah gambar: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    try {
        if (existingProfile) {
            await db
                .update(profiles)
                .set({
                    principalName,
                    principalWelcome,
                    history,
                    principalImageUrl:
                        newImageUrl ?? existingProfile.principalImageUrl,
                    updatedAt: new Date(),
                })
                .where(eq(profiles.id, profileId));
        } else {
            await db.insert(profiles).values({
                id: profileId,
                principalName,
                principalWelcome,
                history,
                principalImageUrl: newImageUrl,
                vision: '',
                mission: '',
            });
        }

        if (newImageUrl && oldImageUrl) {
            await deleteImageFromSupabase(oldImageUrl, 'profile/principal');
        }
        revalidatePath('/admin/profile/principal');
        revalidatePath('/');
        revalidateTag('profile-collection');
        return {
            success: true,
            message: 'Profil berhasil diperbarui.',
            newImageUrl,
        };
    } catch (error) {
        return { success: false, message: `Gagal perbarui profil: ${error instanceof Error ? error.message : String(error)}` };
    }
}

const pastPrincipalSchema = z.object({
    name: z.string().min(1, 'Nama tidak boleh kosong'),
    period: z.string().min(1, 'Periode tidak boleh kosong'),
    image: z.instanceof(File).optional(),
});

export async function createPastPrincipal(formData: FormData) {
    const validatedFields = pastPrincipalSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { name, period, image } = validatedFields.data;
    let imageUrl: string | null = null; // Initialize imageUrl to null

    if (image && image.size > 0) {
        try {
            imageUrl = await uploadImageToSupabase(image, 'profile/past-principals');
        } catch (error) {
            return { success: false, message: `Gagal unggah gambar: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    try {
        await db.insert(pastPrincipals).values({ name, period, imageUrl }); // imageUrl is now properly typed
        revalidatePath('/admin/profile/principal');
        revalidateTag('past-principals-collection');
        return {
            success: true,
            message: 'Riwayat kepala sekolah ditambahkan.',
        };
    } catch (error) {
        return { success: false, message: `Gagal menambahkan data: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function updatePastPrincipal(
    id: number,
    currentImageUrl: string | null,
    formData: FormData,
) {
    const validatedFields = pastPrincipalSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { name, period, image } = validatedFields.data;
    let newImageUrl: string | null = null; // Initialize newImageUrl to null

    const oldImageUrl = currentImageUrl;
    if (image && image.size > 0) {
        try {
            newImageUrl = await uploadImageToSupabase(image, 'profile/past-principals');
        } catch (error) {
            return { success: false, message: `Gagal unggah gambar: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    try {
        await db
            .update(pastPrincipals)
            .set({
                name,
                period,
                imageUrl: newImageUrl ?? currentImageUrl,
            })
            .where(eq(pastPrincipals.id, id));

        if (newImageUrl && oldImageUrl) {
            await deleteImageFromSupabase(oldImageUrl, 'profile/past-principals');
        }
        revalidatePath('/admin/profile/principal');
        revalidateTag('past-principals-collection');
        return { success: true, message: 'Riwayat kepala sekolah diperbarui.' };
    } catch (error) {
        return { success: false, message: `Gagal memperbarui data: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function deletePastPrincipal(id: number, imageUrl: string | null) {
    try {
        await db.delete(pastPrincipals).where(eq(pastPrincipals.id, id));
        await deleteImageFromSupabase(imageUrl, 'profile/past-principals');
        revalidatePath('/admin/profile/principal');
        revalidateTag('past-principals-collection');
        return { success: true, message: 'Data berhasil dihapus.' };
    } catch (error) {
        return { success: false, message: `Gagal menghapus data: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function getPastPrincipals() {
    try {
        const data = await db.query.pastPrincipals.findMany();
        return { success: true, data };
    } catch (error) {
        return { success: false, message: `Failed to fetch past principals: ${error instanceof Error ? error.message : String(error)}` };
    }
}