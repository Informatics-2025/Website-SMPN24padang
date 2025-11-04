'use server';

import { db } from '@/lib/db';
import { achievements } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { AchievementSchema } from './schema';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function getAchievements() {
    try {
        return await db
            .select()
            .from(achievements)
            .orderBy(desc(achievements.createdAt));
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }
}

export async function createAchievement(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'Tidak terautentikasi.' };
    }

    const validatedFields = AchievementSchema.safeParse({
        title: formData.get('title'),
        student: formData.get('student'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(
            validatedFields.error.flatten().fieldErrors,
        )
            .flat()
            .join(', ');
        return { success: false, message: `Validasi gagal: ${errorMessages}` };
    }

    const { title, student, description } = validatedFields.data;
    const imageFile = formData.get('image') as File;
    let imageUrl = null;

    try {
        if (imageFile && imageFile.size > 0) {
            const fileName = `${uuidv4()}-${imageFile.name}`;
            const { data, error } = await supabase.storage
                .from('images')
                .upload(`achievements/${fileName}`, imageFile);

            if (error) {
                throw new Error(`Gagal mengunggah gambar: ${error.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(`achievements/${fileName}`);

            imageUrl = publicUrlData.publicUrl;
        }

        await db.insert(achievements).values({
            id: uuidv4(),
            title,
            student,
            description,
            imageUrl,
        });

        revalidateTag('achievements-collection');
        revalidatePath('/achievements');
        revalidatePath('/admin/achievements');
        return { success: true, message: 'Prestasi berhasil ditambahkan.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal menambahkan prestasi.' };
    }
}

export async function updateAchievement(
    id: string,
    currentImageUrl: string | null,
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'Tidak terautentikasi.' };
    }

    const validatedFields = AchievementSchema.safeParse({
        title: formData.get('title'),
        student: formData.get('student'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(
            validatedFields.error.flatten().fieldErrors,
        )
            .flat()
            .join(', ');
        return { success: false, message: `Validasi gagal: ${errorMessages}` };
    }

    const { title, student, description } = validatedFields.data;
    const imageFile = formData.get('image') as File | null;

    const updateData: {
        title: string;
        student: string;
        description: string;
        imageUrl?: string;
    } = {
        title,
        student,
        description,
    };

    try {
        if (imageFile && imageFile.size > 0) {
            if (currentImageUrl && !currentImageUrl.includes('placehold.co')) {
                const oldImageName = currentImageUrl.split('/').pop();
                if (oldImageName) {
                    await supabase.storage.from('images').remove([`achievements/${oldImageName}`]);
                }
            }
            const fileName = `${uuidv4()}-${imageFile.name}`;
            const { data, error } = await supabase.storage
                .from('images')
                .upload(`achievements/${fileName}`, imageFile);

            if (error) {
                throw new Error('Gagal mengunggah gambar.');
            }

            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(`achievements/${fileName}`);

            updateData.imageUrl = publicUrlData.publicUrl;
        }

        await db
            .update(achievements)
            .set(updateData)
            .where(eq(achievements.id, id));

        revalidateTag('achievements-collection');
        revalidatePath('/achievements');
        revalidatePath('/admin/achievements');
        return { success: true, message: 'Prestasi berhasil diperbarui.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal memperbarui prestasi.' };
    }
}

export async function deleteAchievement(id: string, imageUrl: string | null) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'Tidak terautentikasi.' };
    }

    try {
        if (imageUrl && !imageUrl.includes('placehold.co')) {
            const oldImageName = imageUrl.split('/').pop();
            if (oldImageName) {
                await supabase.storage.from('images').remove([`achievements/${oldImageName}`]);
            }
        }
        await db.delete(achievements).where(eq(achievements.id, id));

        revalidateTag('achievements-collection');
        revalidatePath('/achievements');
        revalidatePath('/admin/achievements');
        return { success: true, message: 'Prestasi berhasil dihapus.' };
    } catch (error: any) {
        console.error('Database deletion failed:', error);
        return { success: false, message: `Gagal menghapus prestasi: ${error.message || error.toString()}` };
    }
}
