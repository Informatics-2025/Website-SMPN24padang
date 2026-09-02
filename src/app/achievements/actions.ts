
"use server";
import { db } from '@/lib/db';
import { achievements } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export const getAchievements = unstable_cache(
  async () => db.select().from(achievements).orderBy(desc(achievements.createdAt)),
  ['public-achievements'],
  { revalidate: 300, tags: ['achievements-collection'] },
);
