"use server";

import { db } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getFaculty = unstable_cache(
  async () => {
    try {
      // Mengambil semua staf dan mengurutkannya berdasarkan urutan kustom jika perlu
      const faculty = await db.select().from(staff).orderBy(asc(staff.name));
      return faculty;
    } catch (error) {
      console.error("Error fetching faculty:", error);
      return [];
    }
  },
  ["public-faculty"],
  { revalidate: 600, tags: ["faculty-collection"] },
);
