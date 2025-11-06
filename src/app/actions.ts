'use server';

import { db } from '@/lib/db';
import {
    banners,
    news,
    announcements,
    profiles,
    statistics,
    facilities,
    pastPrincipals,
    achievements,
} from '@/lib/db/schema';
import { asc, desc, sql } from 'drizzle-orm';
import { unstable_cache as cache } from 'next/cache';
import { supabase } from '@/lib/supabase'; // Import supabase client
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames

export const uploadImage = async (formData: FormData) => {
    const file = formData.get('file') as File;

    if (!file) {
        return { error: 'No file uploaded.' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `public/${fileName}`; // Assuming 'public' folder in your Supabase bucket

    const { data, error } = await supabase.storage
        .from('images') // Replace 'images' with your Supabase bucket name
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        return { error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
        .from('images') // Replace 'images' with your Supabase bucket name
        .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return { error: 'Failed to get public URL.' };
    }

    return { publicUrl: publicUrlData.publicUrl };
};


export const getBanners = cache(
    async () => {
        return await db.select().from(banners).orderBy(asc(banners.createdAt));
    },
    ['banners'],
    { tags: ['banners-collection'] },
);

export const getLatestNews = cache(
    async () => {
        try {
            return await db
                .select()
                .from(news)
                .orderBy(desc(news.date))
                .limit(4);
        } catch (error) {
            console.error('Error fetching latest news:', error);
            return [];
        }
    },
    ['latest-news'],
    { tags: ['news-collection'] },
);

export const getAnnouncements = cache(
    async () => {
        try {
            return await db
                .select()
                .from(announcements)
                .orderBy(desc(announcements.date))
                .limit(3);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            return [];
        }
    },
    ['homepage-announcements'],
    { tags: ['announcements-collection'] },
);

export const getProfile = cache(
    async () => {
        try {
            const profileData = await db.select().from(profiles).limit(1);
            return profileData[0] || null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },
    ['profile'],
    { tags: ['profile-collection'] },
);

export const getStatistics = cache(
    async () => {
        try {
            const statsData = await db.select().from(statistics).limit(1);
            return statsData[0] || null;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return null;
        }
    },
    ['statistics'],
    { tags: ['statistics-collection'] },
);

export const getFacilities = cache(
    async () => {
        try {
            return await db
                .select()
                .from(facilities)
                .orderBy(asc(facilities.createdAt));
        } catch (error) {
            console.error('Error fetching facilities:', error);
            return [];
        }
    },
    ['facilities'],
    { tags: ['facilities-collection'] },
);

export const getAbout = cache(
    async () => {
        try {
            const profileData = await db.select().from(profiles).limit(1);
            const profile = profileData[0] || {};
            return {
                history: profile?.history || '',
                vision: profile?.vision || '',
                mission: profile?.mission ? profile.mission.split('\n') : [],
            };
        } catch (error) {
            console.error('Error fetching about data:', error);
            return {
                history: '',
                vision: '',
                mission: [],
            };
        }
    },
    ['about'],
    { tags: ['profile-collection'] },
);

export const getMarqueeItems = cache(
    async () => {
        try {
            const items: Array<{
                type: 'Berita' | 'Pengumuman' | 'Prestasi';
                text: string;
            }> = [];

            const latestNews = await db
                .select({ title: news.title })
                .from(news)
                .orderBy(desc(news.date))
                .limit(1);
            if (latestNews.length > 0) {
                items.push({ type: 'Berita', text: latestNews[0].title });
            }

            const latestAnnouncement = await db
                .select({ title: announcements.title })
                .from(announcements)
                .orderBy(desc(announcements.date))
                .limit(1);
            if (latestAnnouncement.length > 0) {
                items.push({
                    type: 'Pengumuman',
                    text: latestAnnouncement[0].title,
                });
            }

            const latestAchievement = await db
                .select({ title: achievements.title })
                .from(achievements)
                .orderBy(desc(achievements.createdAt))
                .limit(1);
            if (latestAchievement.length > 0) {
                items.push({ type: 'Prestasi', text: latestAchievement[0].title });
            }

            return items;
        } catch (error) {
            console.error('Error fetching dynamic marquee items:', error);
            return [];
        }
    },
    ['marquee-items'],
    {
        tags: [
            'news-collection',
            'announcements-collection',
            'achievements-collection',
        ],
    },
);

export const getPastPrincipals = cache(
    async () => {
        try {
            return await db
                .select()
                .from(pastPrincipals)
                .orderBy(desc(pastPrincipals.createdAt));
        } catch (error) {
            console.error('Error fetching past principals:', error);
            return [];
        }
    },
    ['past-principals'],
    { tags: ['past-principals-collection'] },
);

export const getAllNewsIds = cache(
    async () => {
        try {
            const ids = await db.select({ id: news.id }).from(news);
            return ids.map((item) => ({ id: item.id }));
        } catch (error) {
            console.error('Error fetching all news IDs:', error);
            return [];
        }
    },
    ['all-news-ids'],
    { tags: ['news-collection'] },
);