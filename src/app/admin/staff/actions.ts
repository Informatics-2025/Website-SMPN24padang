
"use server";

import { db } from '@/lib/db';
import { staff } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { StaffSchema } from "./schema";
import { put, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function createStaff(prevState: any, formData: FormData) {
    const validatedFields = StaffSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: "Validasi data gagal." };
    }

    const { name, position, subject, homeroomOf } = validatedFields.data;
    const imageFile = formData.get('image') as File | null;
    let imageUrl: string | null = null;

    try {
        if (imageFile && imageFile.size > 0) {
            const blob = await put(imageFile.name, imageFile, { access: 'public' });
            imageUrl = blob.url;
        }

        await db.insert(staff).values({ id: uuidv4(), name, position, subject, homeroomOf, imageUrl });

        revalidatePath('/profile/faculty');
        revalidatePath('/admin/staff');
        return { success: true, message: "Staf berhasil ditambahkan." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal menambahkan staf." };
    }
}

export async function updateStaff(id: string, currentImageUrl: string | null, prevState: any, formData: FormData) {
    const validatedFields = StaffSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: "Validasi data gagal." };
    }

    const { name, position, subject, homeroomOf } = validatedFields.data;
    const imageFile = formData.get('image') as File | null;
    
    const updateData: { name: string, position: string, subject?: string | null, homeroomOf?: string | null, imageUrl?: string } = {
        name, position, subject, homeroomOf
    };

    try {
        if (imageFile && imageFile.size > 0) {
            if (currentImageUrl && !currentImageUrl.includes('placehold.co')) {
                await del(currentImageUrl);
            }
            const blob = await put(imageFile.name, imageFile, { access: 'public' });
            updateData.imageUrl = blob.url;
        }

        await db.update(staff).set(updateData).where(eq(staff.id, id));

        revalidatePath('/profile/faculty');
        revalidatePath('/admin/staff');
        return { success: true, message: "Data staf berhasil diperbarui." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal memperbarui data staf." };
    }
}


export async function deleteStaff(id: string, imageUrl: string | null) {
    try {
        if (imageUrl && !imageUrl.includes('placehold.co')) {
            await del(imageUrl);
        }
        await db.delete(staff).where(eq(staff.id, id));
        
        revalidatePath('/profile/faculty');
        revalidatePath('/admin/staff');
        return { success: true, message: 'Data staf berhasil dihapus.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Gagal menghapus data staf.' };
    }
}

export async function getStaff() {
    return await db.select().from(staff).orderBy(asc(staff.name));
}
