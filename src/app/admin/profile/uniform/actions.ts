'use server';

import { db } from '@/lib/db';
import { profiles, uniforms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function getUniformPageDescription() {
    try {
        const profileData = await db.select().from(profiles).limit(1);
        return profileData[0]?.uniformPageDescription || '';
    } catch (error) {
        console.error('Error fetching uniform page description:', error);
        return '';
    }
}

export async function updateUniformPageDescription(description: string) {
    try {
        await db.update(profiles).set({ uniformPageDescription: description }).where(eq(profiles.id, '1')); // Assuming a single profile entry with ID '1'
        revalidatePath('/admin/profile/uniform');
        return { success: true, message: 'Deskripsi halaman seragam berhasil diperbarui.' };
    } catch (error) {
        console.error('Error updating uniform page description:', error);
        return { success: false, message: 'Gagal memperbarui deskripsi halaman seragam.' };
    }
}

export async function updateUniform(formData: FormData) {
    const id = Number(formData.get('uniformId'));
    const day = formData.get('uniformDay') as string | null;
    const type = formData.get('uniformType') as 'daily' | 'sport';
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;

    try {
        const existingUniform = await db.query.uniforms.findFirst({
            where: eq(uniforms.id, id),
        });

        const updateData: Partial<typeof uniforms.$inferInsert> = {
            day,
            type,
            description,
            updatedAt: new Date(),
        };

        if (imageFile && imageFile.size > 0) {
            if (existingUniform?.image) {
                const oldImageName = existingUniform.image.split('/').pop();
                if (oldImageName) {
                    await supabase.storage
                        .from('images')
                        .remove([`profile/uniforms/${oldImageName}`]);
                }
            }

            const fileName = `${uuidv4()}-${imageFile.name}`;
            const { error } = await supabase.storage
                .from('images')
                .upload(`profile/uniforms/${fileName}`, imageFile);

            if (error) {
                throw new Error('Gagal mengunggah gambar.');
            }

            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(`profile/uniforms/${fileName}`);

            updateData.image = publicUrlData.publicUrl;
        }

        await db.update(uniforms).set(updateData).where(eq(uniforms.id, id));

        revalidatePath('/admin/profile/uniform');
        revalidatePath('/profile/uniform');
        return { success: true, message: 'Seragam berhasil diperbarui.' };
    } catch (error) {
        console.error('Error updating uniform:', error);
        return { success: false, message: 'Gagal memperbarui seragam.' };
    }
}

export async function createUniform(formData: FormData) {
    const day = formData.get('uniformDay') as string | null;
    const type = formData.get('uniformType') as 'daily' | 'sport';
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;
    try {
        let imageUrl: string | undefined;
        if (imageFile) {
            const fileName = `${uuidv4()}-${imageFile.name}`;
            const { data, error } = await supabase.storage
                .from('images')
                .upload(`profile/uniforms/${fileName}`, imageFile);

            if (error) {
                throw new Error('Gagal mengunggah gambar.');
            }

            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(`profile/uniforms/${fileName}`);

            imageUrl = publicUrlData.publicUrl;
        }

        await db.insert(uniforms).values({
            day,
            type,
            description,
            image: imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath('/admin/profile/uniform');
        revalidatePath('/profile/uniform');
        return { success: true, message: 'Seragam berhasil ditambahkan.' };
    } catch (error) {
        console.error('Error creating uniform:', error);
        return { success: false, message: 'Gagal menambahkan seragam.' };
    }
}
