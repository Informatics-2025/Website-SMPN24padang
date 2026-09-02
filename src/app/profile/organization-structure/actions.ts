"use server";

import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getOrganizationStructures = unstable_cache(
  async () => {
    try {
      return await db.query.organizationStructures.findMany();
    } catch (error) {
      console.error("Error fetching organization structures:", error);
      return [];
    }
  },
  ["public-organization-structures"],
  { revalidate: 600, tags: ["organization-collection"] },
);
