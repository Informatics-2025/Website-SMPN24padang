import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
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
        url: `https://smpn24padang.sch.id${route}`,
        lastModified: new Date(),
    }));

    // TODO: Add dynamic routes for news and articles

    return [...staticUrls];
}
