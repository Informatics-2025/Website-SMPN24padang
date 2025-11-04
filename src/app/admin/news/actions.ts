'use server';

import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NewsArticleSchema } from './schema';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export async function getNewsForAdmin() {
    return await db.select().from(news).orderBy(desc(news.date));
}



export async function createNewsArticle(prevState: any, formData: FormData) {
    const validatedFields = NewsArticleSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(
            validatedFields.error.flatten().fieldErrors,
        )
            .flat()
            .join(', ');
        return { success: false, message: `Validasi gagal: ${errorMessages}` };
    }

    const { title, description, date } = validatedFields.data;
    const imageFile = formData.get('image') as File | null;
    let imageUrl: string | null = null;

    try {
        if (imageFile && imageFile.size > 0) {
            const fileName = `${uuidv4()}-${imageFile.name}`;
            const { data, error } = await supabase.storage
                .from('images')
                .upload(`news/${fileName}`, imageFile);

            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error(`Gagal mengunggah gambar: ${error.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(`news/${fileName}`);

            imageUrl = publicUrlData.publicUrl;
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
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(
            validatedFields.error.flatten().fieldErrors,
        )
            .flat()
            .join(', ');
        return { success: false, message: `Validasi gagal: ${errorMessages}` };
    }

    const { title, description, date } = validatedFields.data;
    const imageFile = formData.get('image') as File | null;

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

    try {
        if (imageFile && imageFile.size > 0) {
            if (currentImageUrl && !currentImageUrl.includes('placehold.co')) {
                const oldImageName = currentImageUrl.split('/').pop();
                if (oldImageName) {
                    await supabase.storage.from('images').remove([`news/${oldImageName}`]);
                }
            }
            const fileName = `${uuidv4()}-${imageFile.name}`;
            const { data, error } = await supabase.storage
                .from('images')
                .upload(`news/${fileName}`, imageFile);

            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error(`Gagal mengunggah gambar: ${error.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(`news/${fileName}`);

            updateData.imageUrl = publicUrlData.publicUrl;
        }

        await db.update(news).set(updateData).where(eq(news.id, id));

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
        if (imageUrl && !imageUrl.includes('placehold.co')) {
            const oldImageName = imageUrl.split('/').pop();
            if (oldImageName) {
                await supabase.storage.from('images').remove([`news/${oldImageName}`]);
            }
        }
        await db.delete(news).where(eq(news.id, id));

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