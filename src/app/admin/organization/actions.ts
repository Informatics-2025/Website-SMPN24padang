'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { organizationStructures } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const structureSchema = z.object({
    title: z.string().min(1, 'Judul tidak boleh kosong'),
    description: z.string().optional(),
});

export async function getOrganizationStructures() {
    try {
        return await db.query.organizationStructures.findMany();
    } catch (error) {
        console.error('Error fetching organization structures:', error);
        return [];
    }
}

export async function updateOrganizationStructure(
    type: string,
    currentPdfUrl: string | null,
    formData: FormData,
) {
    const validatedFields = structureSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description } = validatedFields.data;
    const pdfFile = formData.get('pdfFile') as File | null;

    const updateData: Partial<typeof organizationStructures.$inferInsert> = {
        title,
        description: description ?? null,
        updatedAt: new Date(),
    };

    try {
        if (pdfFile && pdfFile.size > 0) {
            if (currentPdfUrl) {
                const oldPdfName = currentPdfUrl.split('/').pop();
                if (oldPdfName) {
                    await supabase.storage
                        .from('files')
                        .remove([`organization/${oldPdfName}`]);
                }
            }

            const fileName = `${uuidv4()}-${pdfFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(`organization/${fileName}`, pdfFile);

            if (uploadError) {
                throw new Error(
                    `Gagal mengunggah PDF: ${uploadError.message}`,
                );
            }

            const { data: publicUrlData } = supabase.storage
                .from('files')
                .getPublicUrl(`organization/${fileName}`);

            updateData.pdfUrl = publicUrlData.publicUrl;
        }

        await db
            .update(organizationStructures)
            .set(updateData)
            .where(eq(organizationStructures.type, type));

        revalidatePath('/admin/organization');
        revalidatePath('/profile/organization-structure');

        return {
            success: true,
            message: 'Struktur organisasi berhasil diperbarui.',
        };
    } catch (error) {
        console.error('Error updating structure:', error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Gagal memperbarui data.';
        return { success: false, error: errorMessage };
    }
}
