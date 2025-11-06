'use server';

import { db } from '@/lib/db';
import { galleryItems } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/lib/supabase-storage';

export async function getGalleryItems() {
    return await db
        .select()
        .from(galleryItems)
        .orderBy(desc(galleryItems.createdAt));
}

export async function createGalleryItem(prevState: any, formData: FormData) {
    const alt = formData.get('alt') as string;
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File;
    const orientation = formData.get('orientation') as 'landscape' | 'portrait';

    if (!alt || !category || !imageFile || imageFile.size === 0 || !orientation) {
        return { success: false, message: 'Data tidak lengkap.' };
    }

    try {
        const imageUrl = await uploadImageToSupabase(imageFile, 'gallery');

        if (!imageUrl) {
            return { success: false, message: 'Gagal mengunggah gambar.' };
        }

        await db.insert(galleryItems).values({
            id: uuidv4(),
            src: imageUrl,
            alt,
            category,
            orientation,
        });

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Gambar berhasil ditambahkan.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal menambahkan gambar.' };
    }
}

export async function updateGalleryItem(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const alt = formData.get('alt') as string;
    const category = formData.get('category') as string;
    const orientation = formData.get('orientation') as 'landscape' | 'portrait';

    if (!id || !alt || !category || !orientation) {
        return { success: false, message: 'Data tidak lengkap.' };
    }

    try {
        await db
            .update(galleryItems)
            .set({ alt, category, orientation })
            .where(eq(galleryItems.id, id));

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Gambar berhasil diperbarui.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal memperbarui gambar.' };
    }
}

export async function deleteGalleryItem(id: string, src: string) {
    try {
        await db.delete(galleryItems).where(eq(galleryItems.id, id));
        await deleteImageFromSupabase(src, 'gallery');

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Gambar berhasil dihapus.' };
    } catch (error: any) {
        console.error('Database deletion failed:', error);
        return { success: false, message: `Gagal menghapus gambar: ${error.message || error.toString()}` };
    }
}
