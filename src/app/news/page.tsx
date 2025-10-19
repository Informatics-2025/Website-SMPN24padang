import type { Metadata } from 'next';
import { unstable_cache as cache } from 'next/cache';

export const metadata: Metadata = {
    title: 'Berita & Pengumuman Terbaru SMPN 24 Padang | Informasi Sekolah Terkini',
    description:
        'Berita dan pengumuman terbaru dari SMPN 24 Padang. Dapatkan informasi terkini seputar kegiatan, prestasi, dan acara sekolah.',
};

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

const getAllNews = cache(
    async () => {
        return await db.select().from(news).orderBy(desc(news.date));
    },
    ['all-news'],
    { tags: ['news-collection'] },
);

export default async function NewsPage() {
    const newsItems = await getAllNews();

    return (
        <div className="container mx-auto px-4 py-12 md:py-24">
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
                    Berita & Pengumuman
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Ikuti terus berita, acara, dan pengumuman terbaru dari SMPN
                    24 Padang.
                </p>
            </div>

            <section className="mt-12">
                <h2 className="font-headline text-3xl font-bold text-primary mb-8">
                    Berita Lainnya
                </h2>
                {newsItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {newsItems.map((item) => (
                            <Card
                                key={item.id}
                                className="overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col"
                            >
                                <CardHeader className="p-0">
                                    <Link href={`/news/${item.id}`}>
                                        <Image
                                            src={
                                                item.imageUrl ||
                                                'https://placehold.co/600x400.png'
                                            }
                                            alt={item.title}
                                            width={600}
                                            height={400}
                                            className="h-48 w-full object-cover"
                                        />
                                    </Link>
                                </CardHeader>
                                <CardContent className="flex flex-grow flex-col p-6">
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        {new Date(item.date).toLocaleDateString(
                                            'id-ID',
                                            {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            },
                                        )}
                                    </p>
                                    <CardTitle className="font-headline text-xl font-bold text-primary">
                                        <Link
                                            href={`/news/${item.id}`}
                                            className="hover:underline"
                                        >
                                            {item.title}
                                        </Link>
                                    </CardTitle>
                                    <p className="mt-2 flex-grow text-foreground/80 dark:text-foreground/70">
                                        {item.description.substring(0, 100)}...
                                    </p>
                                    <Button
                                        variant="link"
                                        asChild
                                        className="mt-4 p-0 self-start text-accent hover:text-accent/80"
                                    >
                                        <Link href={`/news/${item.id}`}>
                                            Baca Lebih Lanjut{' '}
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground mt-8">
                        Belum ada berita yang dipublikasikan.
                    </p>
                )}
            </section>
        </div>
    );
}
