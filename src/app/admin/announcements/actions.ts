"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { AnnouncementSchema } from "./schema";

export async function getAnnouncementsForAdmin() {
  try {
    return await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.date));
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function createAnnouncement(
  prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const validatedFields = AnnouncementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    pdfUrl: formData.get("pdfUrl"),
  });

  if (!validatedFields.success) {
    const errorMessages = Object.values(
      validatedFields.error.flatten().fieldErrors,
    )
      .flat()
      .join(", ");
    return { success: false, message: `Validasi gagal: ${errorMessages}` };
  }

  const { title, description, date, pdfUrl } = validatedFields.data;

  try {
    await db.insert(announcements).values({
      id: uuidv4(),
      title,
      description,
      date: date.toISOString(),
      pdfUrl,
    });

    revalidateTag("announcements-collection");
    revalidatePath("/pengumuman");
    revalidatePath("/admin/announcements");
    return { success: true, message: "Pengumuman berhasil dibuat." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal membuat pengumuman." };
  }
}

export async function updateAnnouncement(
  id: string,
  prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const validatedFields = AnnouncementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    pdfUrl: formData.get("pdfUrl"),
  });

  if (!validatedFields.success) {
    const errorMessages = Object.values(
      validatedFields.error.flatten().fieldErrors,
    )
      .flat()
      .join(", ");
    return { success: false, message: `Validasi gagal: ${errorMessages}` };
  }

  const { title, description, date, pdfUrl } = validatedFields.data;

  const updateData: {
    title: string;
    description: string;
    date: string;
    pdfUrl?: string | null;
  } = {
    title,
    description,
    date: date.toISOString(),
    pdfUrl,
  };

  try {
    await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, id));

    revalidateTag("announcements-collection");
    revalidatePath(`/announcements/${id}`);
    revalidatePath("/pengumuman");
    revalidatePath("/admin/announcements");
    return { success: true, message: "Pengumuman berhasil diperbarui." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui pengumuman." };
  }
}

export async function deleteAnnouncement(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  try {
    await db.delete(announcements).where(eq(announcements.id, id));

    revalidateTag("announcements-collection");
    revalidatePath("/pengumuman");
    revalidatePath("/admin/announcements");
    return { success: true, message: "Pengumuman berhasil dihapus." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus pengumuman." };
  }
}
