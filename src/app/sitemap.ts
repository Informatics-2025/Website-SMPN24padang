import { MetadataRoute } from 'next';
import { getAllNewsIds } from './actions';
import { getAllWasteNewsIds } from './admin/banksampah/actions';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smpn24padang.sch.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes = [
        '',
        '/achievements',
        '/contact',
        '/gallery',
        '/news',
        '/pengumuman',
        '/profile',
        '/profile/accreditation',
        '/profile/curriculum',
        '/profile/faculty',
        '/profile/organization-structure',
        '/profile/past-principals',
        '/profile/uniform',
        '/profile/vision-mission',
        '/sispendik',
        '/videos',
    ];

    const staticUrls = staticRoutes.map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
    }));

    // Dynamic news articles
    const newsIds = await getAllNewsIds();
    const newsUrls = newsIds.map(item => ({
        url: `${siteUrl}/news/${item.id}`,
        lastModified: new Date(), // Or a date from the article if available
    }));

    // Dynamic waste news articles
    const wasteNewsIds = await getAllWasteNewsIds();
    const wasteNewsUrls = wasteNewsIds.map(item => ({
        url: `${siteUrl}/articles/${item.id}`,
        lastModified: new Date(),
    }));

    return [...staticUrls, ...newsUrls, ...wasteNewsUrls];
}