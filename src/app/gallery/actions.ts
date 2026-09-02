"use server";

import { db } from "@/lib/db";
import { galleryItems } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getGalleryItems = unstable_cache(
  async () =>
    db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt)),
  ["public-gallery-items"],
  { revalidate: 300, tags: ["gallery-collection"] },
);
