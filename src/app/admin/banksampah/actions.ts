'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { wasteNews, wasteDocumentation, wasteVideos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/lib/supabase-storage';

// Zod Schemas
const NewsSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    previewUrl: z.string().optional(),
    googleDriveUrl: z.string().optional(),
});

const DocSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    imageUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
});

const CreateNewsSchema = NewsSchema.omit({ id: true });
const UpdateNewsSchema = NewsSchema;
const CreateDocSchema = DocSchema.omit({ id: true });
const UpdateDocSchema = DocSchema;

const VideoSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    youtubeUrl: z.string().url('Invalid YouTube URL'),
});

const CreateVideoSchema = VideoSchema.omit({ id: true });
const UpdateVideoSchema = VideoSchema;

// Waste News Actions
export async function getWasteNews() {
    return await db.query.wasteNews.findMany();
}

export async function createWasteNews(prevState: any, formData: FormData) {
    const validatedFields = CreateNewsSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        googleDriveUrl: formData.get('googleDriveUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal', errors: validatedFields.error.flatten().fieldErrors };
    }

    const imageFile = formData.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) {
        return { success: false, message: 'Gambar berita wajib diunggah.' };
    }

    let imageUrl: string | null = null;

    try {
        imageUrl = await uploadImageToSupabase(imageFile, 'banksampah/news');

        if (!imageUrl) {
            return { success: false, message: 'Gagal mengunggah gambar.' };
        }

        await db.insert(wasteNews).values({
            title: validatedFields.data.title,
            description: validatedFields.data.description,
            previewUrl: imageUrl,
            googleDriveUrl: validatedFields.data.googleDriveUrl || null,
        });
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Berita berhasil ditambahkan' };
    } catch (error) {
        console.error('Error creating waste news:', error);
        if (imageUrl) {
            try { await deleteImageFromSupabase(imageUrl, 'banksampah/news'); } catch { /* ignore */ }
        }
        if (error instanceof Error) {
            return { success: false, message: `Gagal menambahkan berita: ${error.message}` };
        }
        return { success: false, message: 'Gagal menambahkan berita karena error tidak diketahui.' };
    }
}

export async function updateWasteNews(id: number, prevState: any, formData: FormData) {
    const validatedFields = UpdateNewsSchema.safeParse({
        id: id.toString(),
        title: formData.get('title'),
        description: formData.get('description'),
        googleDriveUrl: formData.get('googleDriveUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { title, description, googleDriveUrl } = validatedFields.data;
    const imageFile = formData.get('image') as File | null;

    const updateData: Partial<typeof wasteNews.$inferInsert> = {
        title,
        description,
        googleDriveUrl: googleDriveUrl || null,
    };

    let newUrl: string | null = null;
    const existing = await db.query.wasteNews.findFirst({ where: eq(wasteNews.id, id) });
    const currentImageUrl = existing?.previewUrl;

    try {
        if (imageFile && imageFile.size > 0) {
            newUrl = await uploadImageToSupabase(imageFile, 'banksampah/news');
            if (newUrl) {
                updateData.previewUrl = newUrl;
            }
        }

        await db.update(wasteNews).set(updateData).where(eq(wasteNews.id, id));

        if (newUrl && currentImageUrl) {
            await deleteImageFromSupabase(currentImageUrl, 'banksampah/news');
        }
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Berita berhasil diperbarui' };
    } catch (error) {
        console.error('Error updating waste news:', error);
        if (newUrl) {
            try { await deleteImageFromSupabase(newUrl, 'banksampah/news'); } catch { /* ignore */ }
        }
        if (error instanceof Error) {
            return { success: false, message: `Gagal memperbarui berita: ${error.message}` };
        }
        return { success: false, message: 'Gagal memperbarui berita karena error tidak diketahui.' };
    }
}

export async function deleteWasteNews(id: number) {
    try {
        const existing = await db.query.wasteNews.findFirst({ where: eq(wasteNews.id, id) });

        await db.delete(wasteNews).where(eq(wasteNews.id, id));

        if (existing?.previewUrl) {
            await deleteImageFromSupabase(existing.previewUrl, 'banksampah/news');
        }
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Berita berhasil dihapus' };
    } catch (error) {
        return { success: false, message: 'Gagal menghapus berita' };
    }
}

// Waste Documentation Actions
export async function getWasteDocumentation() {
    return await db.query.wasteDocumentation.findMany();
}

export async function createWasteDocumentation(prevState: any, formData: FormData) {
    const validatedFields = CreateDocSchema.safeParse({
        title: formData.get('title'),
        youtubeUrl: formData.get('youtubeUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal', errors: validatedFields.error.flatten().fieldErrors };
    }

    const imageFile = formData.get('image') as File | null;
    let imageUrl: string | null = null;

    try {
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToSupabase(imageFile, 'banksampah/documentation');
        }

        await db.insert(wasteDocumentation).values({
            title: validatedFields.data.title,
            imageUrl: imageUrl,
            youtubeUrl: validatedFields.data.youtubeUrl || null,
        });
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Dokumentasi berhasil ditambahkan' };
    } catch (error) {
        if (imageUrl) {
            try { await deleteImageFromSupabase(imageUrl, 'banksampah/documentation'); } catch { /* ignore */ }
        }
        return { success: false, message: 'Gagal menambahkan dokumentasi' };
    }
}

export async function updateWasteDocumentation(id: number, prevState: any, formData: FormData) {
    const validatedFields = UpdateDocSchema.safeParse({
        id: id.toString(),
        title: formData.get('title'),
        youtubeUrl: formData.get('youtubeUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { title, youtubeUrl } = validatedFields.data;
    const imageFile = formData.get('image') as File | null;

    const updateData: Partial<typeof wasteDocumentation.$inferInsert> = {
        title,
        youtubeUrl: youtubeUrl || null,
    };

    let newUrl: string | null = null;
    const existing = await db.query.wasteDocumentation.findFirst({ where: eq(wasteDocumentation.id, id) });
    const currentImageUrl = existing?.imageUrl;

    try {
        if (imageFile && imageFile.size > 0) {
            newUrl = await uploadImageToSupabase(imageFile, 'banksampah/documentation');
            updateData.imageUrl = newUrl;
        }

        await db.update(wasteDocumentation).set(updateData).where(eq(wasteDocumentation.id, id));

        if (newUrl && currentImageUrl) {
            await deleteImageFromSupabase(currentImageUrl, 'banksampah/documentation');
        }
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Dokumentasi berhasil diperbarui' };
    } catch (error) {
        if (newUrl) {
            try { await deleteImageFromSupabase(newUrl, 'banksampah/documentation'); } catch { /* ignore */ }
        }
        if (error instanceof Error) {
            return { success: false, message: `Gagal memperbarui dokumentasi: ${error.message}` };
        }
        return { success: false, message: 'Gagal memperbarui dokumentasi' };
    }
}

export async function deleteWasteDocumentation(id: number) {
    try {
        const existing = await db.query.wasteDocumentation.findFirst({ where: eq(wasteDocumentation.id, id) });

        await db.delete(wasteDocumentation).where(eq(wasteDocumentation.id, id));

        if (existing?.imageUrl) {
            await deleteImageFromSupabase(existing.imageUrl, 'banksampah/documentation');
        }
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Dokumentasi berhasil dihapus' };
    } catch (error) {
        return { success: false, message: 'Gagal menghapus dokumentasi' };
    }
}

// Waste Video Actions
export async function getWasteVideos() {
    return await db.query.wasteVideos.findMany({
        orderBy: (videos, { desc }) => [desc(videos.createdAt)],
    });
}

export async function createWasteVideo(prevState: any, formData: FormData) {
    const validatedFields = CreateVideoSchema.safeParse({
        title: formData.get('title'),
        youtubeUrl: formData.get('youtubeUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await db.insert(wasteVideos).values({
            title: validatedFields.data.title,
            youtubeUrl: validatedFields.data.youtubeUrl,
        });
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Video berhasil ditambahkan' };
    } catch (error) {
        console.error('Error creating waste video:', error);
        if (error instanceof Error) {
            return { success: false, message: `Gagal menambahkan video: ${error.message}` };
        }
        return { success: false, message: 'Gagal menambahkan video karena error tidak diketahui.' };
    }
}

export async function updateWasteVideo(id: number, prevState: any, formData: FormData) {
    const validatedFields = UpdateVideoSchema.safeParse({
        id: id.toString(),
        title: formData.get('title'),
        youtubeUrl: formData.get('youtubeUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await db.update(wasteVideos).set({
            title: validatedFields.data.title,
            youtubeUrl: validatedFields.data.youtubeUrl,
        }).where(eq(wasteVideos.id, id));
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Video berhasil diperbarui' };
    } catch (error) {
        console.error('Error updating waste video:', error);
        if (error instanceof Error) {
            return { success: false, message: `Gagal memperbarui video: ${error.message}` };
        }
        return { success: false, message: 'Gagal memperbarui video karena error tidak diketahui.' };
    }
}

export async function deleteWasteVideo(id: number) {
    try {
        await db.delete(wasteVideos).where(eq(wasteVideos.id, id));
        revalidatePath('/admin/banksampah');
        return { success: true, message: 'Video berhasil dihapus' };
    } catch (error) {
        return { success: false, message: 'Gagal menghapus video' };
    }
}

// Public-facing functions
export async function getPublicWasteNews() {
    return await db.query.wasteNews.findMany({
        orderBy: (news, { desc }) => [desc(news.createdAt)],
    });
}

export async function getWasteNewsById(id: number) {
    return await db.query.wasteNews.findFirst({
        where: eq(wasteNews.id, id),
    });
}

export async function getPublicWasteDocumentation() {
    return await db.query.wasteDocumentation.findMany({
        orderBy: (docs, { desc }) => [desc(docs.createdAt)],
    });
}

export async function getPublicWasteVideos() {
    return await db.query.wasteVideos.findMany({
        orderBy: (videos, { desc }) => [desc(videos.createdAt)],
    });
}

export async function getAllWasteNewsIds() {
    try {
        const ids = await db.select({ id: wasteNews.id }).from(wasteNews);
        return ids.map((item) => ({ id: item.id }));
    } catch (error) {
        console.error('Error fetching all waste news IDs:', error);
        return [];
    }
}
