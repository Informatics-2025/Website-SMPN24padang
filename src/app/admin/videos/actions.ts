"use server";

import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getVideos() {
  try {
    const data = await db.query.videos.findMany();
    return {
      success: true,
      data: data,
      message: "Videos fetched successfully.",
    };
  } catch (error: unknown) {
    console.error("Error fetching videos:", error);
    return {
      success: false,
      data: [],
      message: `Failed to fetch videos: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function createVideo(data: typeof videos.$inferInsert) {
  try {
    await db.insert(videos).values(data);
    revalidatePath("/admin/videos");
    revalidatePath("/videos");
    return { success: true, message: "Video berhasil ditambahkan." };
  } catch (error: unknown) {
    console.error("Error creating video:", error);
    return {
      success: false,
      message: `Gagal menambahkan video: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function updateVideo(
  id: number,
  data: Partial<typeof videos.$inferInsert>,
) {
  try {
    await db.update(videos).set(data).where(eq(videos.id, id));
    revalidatePath("/admin/videos");
    revalidatePath("/videos");
    return { success: true, message: "Video berhasil diperbarui." };
  } catch (error: unknown) {
    console.error("Error updating video:", error);
    return {
      success: false,
      message: `Gagal memperbarui video: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function deleteVideo(id: number) {
  try {
    await db.delete(videos).where(eq(videos.id, id));
    revalidatePath("/admin/videos");
    revalidatePath("/videos");
    return { success: true, message: "Video berhasil dihapus." };
  } catch (error: unknown) {
    console.error("Error deleting video:", error);
    return {
      success: false,
      message: `Gagal menghapus video: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
