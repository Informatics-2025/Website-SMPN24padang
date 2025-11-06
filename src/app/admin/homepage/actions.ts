'use server';

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { banners, facilities, statistics } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidateTag, revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/lib/supabase-storage';

export async function getHomepageData() {
    try {
        const [bannersData, statisticsData, facilitiesData] = await Promise.all(
            [
                db.select().from(banners).orderBy(desc(banners.createdAt)),
                db.select().from(statistics).limit(1),
                db
                    .select()
                    .from(facilities)
                    .orderBy(desc(facilities.createdAt)),
            ],
        );
        return {
            banners: bannersData,
            statistics: statisticsData[0] || null,
            facilities: facilitiesData,
        };
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        return { banners: [], statistics: null, facilities: [] };
    }
}

function revalidateHomepage() {
    revalidatePath('/');
    revalidatePath('/admin/homepage');
}

export async function createBanner(formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File | null;
        let imageUrl: string | null = null;

        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToSupabase(imageFile, 'homepage/banners');
        }

        await db
            .insert(banners)
            .values({ id: uuidv4(), title, description, imageUrl });
        revalidateHomepage();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal membuat spanduk.' };
    }
}

export async function updateBanner(
    id: string,
    currentImageUrl: string | null,
    formData: FormData,
) {
    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File | null;

        const updateData: {
            title: string;
            description: string;
            imageUrl?: string | null;
            updatedAt: Date;
        } = {
            title,
            description,
            updatedAt: new Date(),
        };

        const oldImageUrl = currentImageUrl;

        if (imageFile && imageFile.size > 0) {
            updateData.imageUrl = await uploadImageToSupabase(imageFile, 'homepage/banners');
        }

        await db.update(banners).set(updateData).where(eq(banners.id, id));

        if (imageFile && imageFile.size > 0) {
            await deleteImageFromSupabase(oldImageUrl, 'homepage/banners');
        }
        revalidateHomepage();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal memperbarui spanduk.' };
    }
}

export async function deleteBanner(id: string, imageUrl: string | null) {
    try {
        await db.delete(banners).where(eq(banners.id, id));
        await deleteImageFromSupabase(imageUrl, 'homepage/banners');
        revalidateHomepage();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal menghapus spanduk.' };
    }
}

export async function updateStatistics(data: {
    classrooms: number;
    students: number;
    teachers: number;
    staff: number;
}) {
    try {
        const existingStats = await db.select().from(statistics).limit(1);
        if (existingStats.length > 0) {
            await db
                .update(statistics)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(statistics.id, existingStats[0].id));
        } else {
            await db.insert(statistics).values({ id: uuidv4(), ...data });
        }
        revalidateHomepage();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal memperbarui statistik.' };
    }
}

export async function createFacility(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const imageFile = formData.get('image') as File | null;
        let imageUrl: string | null = null;

        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToSupabase(imageFile, 'homepage/facilities');
        }

        if (!imageUrl) {
            return { success: false, error: 'Gambar wajib diisi.' };
        }

        await db.insert(facilities).values({ id: uuidv4(), name, imageUrl });
        revalidateHomepage();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal membuat fasilitas.' };
    }
}

export async function updateFacility(
    id: string,
    currentImageUrl: string | null,
    formData: FormData,
) {
    try {
        const name = formData.get('name') as string;
        const imageFile = formData.get('image') as File | null;

        const updatePayload: { name: string; updatedAt: Date; imageUrl?: string | null } = {
            name,
            updatedAt: new Date(),
        };

        const oldImageUrl = currentImageUrl;

        if (imageFile && imageFile.size > 0) {
            const uploadedImageUrl = await uploadImageToSupabase(imageFile, 'homepage/facilities');
            if (uploadedImageUrl) {
                updatePayload.imageUrl = uploadedImageUrl;
            } else {
                updatePayload.imageUrl = null; // Explicitly set to null if upload failed or no image
            }
        } else if (currentImageUrl) {
            // If no new image is provided, and there was a current image, keep it.
            // We don't set imageUrl in updatePayload, so Drizzle will not update it.
        } else {
            // If no new image is provided and there was no current image, imageUrl should remain null.
            // We explicitly set it to null in the payload.
            updatePayload.imageUrl = null;
        }

        await db
            .update(facilities)
            .set(updatePayload) // Line 181
            .where(eq(facilities.id, id));

        if (imageFile && imageFile.size > 0) {
            await deleteImageFromSupabase(oldImageUrl, 'homepage/facilities');
        }
        revalidateHomepage();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal memperbarui fasilitas.' };
    }
}

export async function deleteFacility(id: string, imageUrl: string | null) {
    try {
        await db.delete(facilities).where(eq(facilities.id, id));
        await deleteImageFromSupabase(imageUrl, 'homepage/facilities');
        revalidateHomepage();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal menghapus fasilitas.' };
    }
}
