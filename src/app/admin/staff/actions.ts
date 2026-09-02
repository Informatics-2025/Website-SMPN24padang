"use server";

import { db } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import {
  deleteImageFromSupabase,
  uploadImageToSupabase,
} from "@/lib/supabase-storage";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { StaffSchema } from "./schema";

export async function createStaff(prevState: unknown, formData: FormData) {
  const validatedFields = StaffSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return { success: false, message: "Validasi data gagal." };
  }

  const { name, position, subject, homeroomOf } = validatedFields.data;
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  try {
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImageToSupabase(imageFile, "staff");
    }

    await db
      .insert(staff)
      .values({ id: uuidv4(), name, position, subject, homeroomOf, imageUrl });

    revalidatePath("/profile/faculty");
    revalidatePath("/admin/staff");
    return { success: true, message: "Staf berhasil ditambahkan." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menambahkan staf." };
  }
}

export async function updateStaff(
  id: string,
  currentImageUrl: string | null,
  prevState: unknown,
  formData: FormData,
) {
  const validatedFields = StaffSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return { success: false, message: "Validasi data gagal." };
  }

  const { name, position, subject, homeroomOf } = validatedFields.data;
  const imageFile = formData.get("image") as File | null;

  const updateData: {
    name: string;
    position: string;
    subject?: string | null;
    homeroomOf?: string | null;
    imageUrl?: string | null;
  } = {
    name,
    position,
    subject,
    homeroomOf,
  };

  const oldImageUrl = currentImageUrl;

  try {
    if (imageFile && imageFile.size > 0) {
      updateData.imageUrl = await uploadImageToSupabase(imageFile, "staff");
    }

    await db.update(staff).set(updateData).where(eq(staff.id, id));

    if (imageFile && imageFile.size > 0) {
      await deleteImageFromSupabase(oldImageUrl, "staff");
    }

    revalidatePath("/profile/faculty");
    revalidatePath("/admin/staff");
    return { success: true, message: "Data staf berhasil diperbarui." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui data staf." };
  }
}

export async function deleteStaff(id: string, imageUrl: string | null) {
  try {
    await db.delete(staff).where(eq(staff.id, id));
    await deleteImageFromSupabase(imageUrl, "staff");

    revalidatePath("/profile/faculty");
    revalidatePath("/admin/staff");
    return { success: true, message: "Data staf berhasil dihapus." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus data staf." };
  }
}

export async function getStaff() {
  return await db.select().from(staff).orderBy(asc(staff.name));
}
