import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImageToSupabase(file: File, folder: string): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }

    const sanitizedFileName = file.name
        .normalize('NFD') // Normalize Unicode characters
        .replace(/[^\x20-\x7E]/g, '') // Remove all non-ASCII characters
        .replace(/[^a-zA-Z0-9-_.]/g, '-') // Replace non-alphanumeric, non-hyphen, non-underscore, non-dot with hyphen
        .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    const fileName = `${uuidv4()}-${sanitizedFileName}`;
    const { data, error } = await supabase.storage
        .from('images')
        .upload(`${folder}/${fileName}`, file);

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Gagal mengunggah gambar: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(`${folder}/${fileName}`);

    return publicUrlData.publicUrl;
}

export async function deleteImageFromSupabase(imageUrl: string | null, folder: string): Promise<void> {
    if (!imageUrl || imageUrl.includes('placehold.co')) {
        return;
    }

    const imageName = imageUrl.split('/').pop();
    if (imageName) {
        const { error } = await supabase.storage.from('images').remove([`${folder}/${imageName}`]);
        if (error) {
            console.error('Supabase delete error:', error);
            throw new Error(`Gagal menghapus gambar: ${error.message}`);
        }
    }
}
