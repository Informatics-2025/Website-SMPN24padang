"use server";

import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getUniforms = unstable_cache(
  async () => {
    const allUniforms = await db.query.uniforms.findMany();
    return allUniforms;
  },
  ["public-uniforms"],
  { revalidate: 600, tags: ["uniform-collection"] },
);
