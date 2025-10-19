'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getPublicWasteNews } from '@/app/admin/banksampah/actions';
import { WasteNewsItem } from '@/app/admin/banksampah/page'; // Re-using type from admin page
import SkeletonLoader from '@/components/skeleton-loader';

export default function Tab2_Articles() { // Renamed component
    const [news, setNews] = useState<WasteNewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const newsData = await getPublicWasteNews();
                setNews(newsData as WasteNewsItem[]);
            } catch (error) {
                console.error("Failed to fetch waste news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="space-y-8 pt-6">
            {news.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>Belum ada artikel yang dipublikasikan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <Link key={item.id} href={`/articles/${item.id}`} className="block hover:no-underline">
                            <Card className="overflow-hidden flex flex-col h-full transition-all hover:border-primary">
                                <CardHeader>
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={item.previewUrl || 'https://placehold.co/600x400.png'}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <CardTitle className="pt-4">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription className="line-clamp-3">
                                        {item.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}