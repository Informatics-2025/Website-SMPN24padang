'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getPublicWasteNews, getPublicWasteVideos } from '@/app/admin/banksampah/actions';
import { WasteNewsItem, WasteVideoItem } from '@/types/banksampah';
import SkeletonLoader from '@/components/skeleton-loader';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { YouTubeEmbed, getYouTubeVideoId } from '@/components/youtube-embed';
import { PlayCircle } from 'lucide-react';

function ArticlesSection() {
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
            <h2 className="text-2xl font-bold">Artikel Edukasi</h2>
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

function VideosSection() {
    const [videos, setVideos] = useState<WasteVideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const videoData = await getPublicWasteVideos();
                setVideos(videoData as WasteVideoItem[]);
            } catch (error) {
                console.error("Failed to fetch waste videos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const openVideo = (youtubeUrl: string) => {
        setSelectedVideoUrl(youtubeUrl);
    };

    const closeVideo = () => {
        setSelectedVideoUrl(null);
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="space-y-8 pt-6">
            <h2 className="text-2xl font-bold">Video Edukasi</h2>
            {videos.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>Belum ada video yang dipublikasikan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((item) => {
                        const videoId = getYouTubeVideoId(item.youtubeUrl);

                        return (
                            <Card key={item.id} className="overflow-hidden">
                                <CardHeader className="p-0">
                                    <div className="relative w-full aspect-video group">
                                        {videoId && (
                                            <button onClick={() => openVideo(item.youtubeUrl)} className="w-full h-full" aria-label={`Putar video ${item.title}`}>
                                                <Image
                                                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center" aria-hidden="true">
                                                    <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="truncate">{item.title}</CardTitle>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={!!selectedVideoUrl} onOpenChange={(isOpen) => !isOpen && closeVideo()}>
                <DialogContent className="max-w-4xl p-0">
                    {selectedVideoUrl && (
                        <YouTubeEmbed url={selectedVideoUrl} title="Video Edukasi Bank Sampah" />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function Tab2_Articles() {
    return (
        <div>
            <ArticlesSection />
            <VideosSection />
        </div>
    );
}
