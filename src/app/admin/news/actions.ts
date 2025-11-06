'use server';

import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NewsArticleSchema } from './schema';
import { v4 as uuidv4 } from 'uuid';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/lib/supabase-storage';

export async function getNewsForAdmin() {
    return await db.select().from(news).orderBy(desc(news.date));
}



export async function createNewsArticle(prevState: any, formData: FormData) {
    const validatedFields = NewsArticleSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(
            validatedFields.error.flatten().fieldErrors,
        )
            .flat()
            .join(', ');
        return { success: false, message: `Validasi gagal: ${errorMessages}` };
    }

    const { title, description, date, image } = validatedFields.data;
    const imageFile = image as File | null;
    let imageUrl: string | null = null;

    try {
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToSupabase(imageFile, 'news');
        }

        const [newArticle] = await db.insert(news).values({
            id: uuidv4(),
            title,
            description,
            date: date.toISOString(),
            imageUrl,
        }).returning({ id: news.id });

        revalidateTag('news-collection');
        revalidatePath('/admin/news');
        revalidatePath('/news');
        revalidatePath(`/news/${newArticle.id}`);
        return { success: true, message: 'Artikel berhasil dibuat.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal membuat artikel.' };
    }
}

export async function updateNewsArticle(
    id: string,
    currentImageUrl: string | null,
    prevState: any,
    formData: FormData,
) {
    const validatedFields = NewsArticleSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(
            validatedFields.error.flatten().fieldErrors,
        )
            .flat()
            .join(', ');
        return { success: false, message: `Validasi gagal: ${errorMessages}` };
    }

    const { title, description, date, image } = validatedFields.data;
    const imageFile = image as File | null;

    const updateData: {
        title: string;
        description: string;
        date: string;
        imageUrl?: string;
    } = {
        title,
        description,
        date: date.toISOString(),
    };

    const oldImageUrl = currentImageUrl;

    try {
        if (imageFile && imageFile.size > 0) {
            updateData.imageUrl = await uploadImageToSupabase(imageFile, 'news');
        }

        await db.update(news).set(updateData).where(eq(news.id, id));

        if (imageFile && imageFile.size > 0 && oldImageUrl) {
            await deleteImageFromSupabase(oldImageUrl, 'news');
        }

        revalidateTag('news-collection');
        revalidatePath(`/articles/${id}`);
        revalidatePath('/admin/news');
        revalidatePath('/news');
        revalidatePath(`/news/${id}`);
        return { success: true, message: 'Artikel berhasil diperbarui.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal memperbarui artikel.' };
    }
}

export async function deleteNewsArticle(id: string, imageUrl: string | null) {
    try {
        await db.delete(news).where(eq(news.id, id));

        if (imageUrl && !imageUrl.includes('placehold.co')) {
            await deleteImageFromSupabase(imageUrl, 'news');
        }

        revalidateTag('news-collection');
        revalidatePath('/admin/news');
        revalidatePath('/news');
        revalidatePath(`/news/${id}`);
        return { success: true, message: 'Berita berhasil dihapus.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal menghapus berita.' };
    }
}