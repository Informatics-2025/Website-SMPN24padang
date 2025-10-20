'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getPublicWasteDocumentation } from '@/app/admin/banksampah/actions';
import { WasteDocumentationItem } from '@/types/banksampah';
import { YouTubeEmbed, getYouTubeVideoId } from '@/components/youtube-embed'; // Corrected import casing
import SkeletonLoader from '@/components/skeleton-loader';
import { PlayCircle, ZoomIn } from 'lucide-react';



export default function Tab3_Documentation() {
    const [docs, setDocs] = useState<WasteDocumentationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<WasteDocumentationItem | null>(null); // State for image popup

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const docData = await getPublicWasteDocumentation();
                setDocs(docData as WasteDocumentationItem[]);
            } catch (error) {
                console.error("Failed to fetch waste documentation:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, []);

    const openVideo = (youtubeUrl: string) => {
        setSelectedVideoUrl(youtubeUrl);
    };

    const closeVideo = () => {
        setSelectedVideoUrl(null);
    };

    const openImage = (item: WasteDocumentationItem) => {
        setSelectedItem(item);
    };

    const closeImage = () => {
        setSelectedItem(null);
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="space-y-8 pt-6">
            {docs.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>Belum ada dokumentasi yang dipublikasikan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {docs.map((item) => {
                        const videoId = item.youtubeUrl ? getYouTubeVideoId(item.youtubeUrl) : null;

                        return (
                            <Card key={item.id} className="overflow-hidden">
                                <CardHeader className="p-0">
                                    <div className="relative w-full aspect-[4/3] group">
                                        {videoId && item.youtubeUrl ? (
                                            // YouTube Thumbnail
                                            <button onClick={() => openVideo(item.youtubeUrl!)} className="w-full h-full">
                                                <Image
                                                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                                    <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        ) : (
                                            // Regular Image with Popup
                                            <button onClick={() => item.imageUrl && openImage(item)} className="w-full h-full text-left">
                                                <Image
                                                    src={item.imageUrl || 'https://placehold.co/600x400.png'}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <ZoomIn className="w-12 h-12 text-white" />
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

            {/* Video Player Dialog */}
            <Dialog open={!!selectedVideoUrl} onOpenChange={(isOpen) => !isOpen && closeVideo()}>
                <DialogContent className="max-w-7xl p-0">
                    {selectedVideoUrl && (
                        <YouTubeEmbed url={selectedVideoUrl} title="Dokumentasi Bank Sampah" />
                    )}
                </DialogContent>
            </Dialog>

            {/* Image Viewer Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(isOpen) => !isOpen && closeImage()}>
                <DialogContent className="max-w-5xl p-4">
                    {selectedItem && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                            <div className="relative w-full h-auto">
                                <Image
                                    src={selectedItem.imageUrl!}
                                    alt={selectedItem.title}
                                    width={1920}
                                    height={1080}
                                    className="object-contain w-full h-auto rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}