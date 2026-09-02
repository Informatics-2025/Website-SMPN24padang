'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import placeholders from '@/lib/placeholders.json';

interface Banner {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface ClientCarouselProps {
    banners: Banner[];
}

export function ClientCarousel({ banners }: ClientCarouselProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    const typedPlaceholders = placeholders as Array<{ src: string; base64: string }>;

    // Stable autoplay plugin instance with smooth pause on hover
    const autoplayPlugin = useMemo(
        () =>
            Autoplay({
                delay: 5000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        []
    );

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on('select', onSelect);
        api.on('reInit', onSelect);

        return () => {
            api.off('select', onSelect);
            api.off('reInit', onSelect);
        };
    }, [api]);

    const scrollTo = useCallback(
        (index: number) => {
            api?.scrollTo(index);
        },
        [api]
    );

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <Carousel
            setApi={setApi}
            opts={{
                loop: true,
                duration: 25,
                skipSnaps: false,
            }}
            plugins={[autoplayPlugin]}
            className="w-full relative group overflow-hidden"
        >
            <CarouselContent className="ml-0 transform-gpu">
                {banners.map((banner, index) => {
                    const placeholder = typedPlaceholders.find(
                        (p) => p.src === banner.imageUrl
                    );
                    const isFirst = index === 0;

                    return (
                        <CarouselItem key={banner.id || index} className="pl-0 basis-full">
                            <div className="relative h-[42vh] w-full sm:h-[60vh] lg:h-[72vh] overflow-hidden transform-gpu">
                                {/* Next.js Optimized Image with GPU-accelerated rendering */}
                                <Image
                                    src={
                                        banner.imageUrl ||
                                        'https://placehold.co/1920x1080.png'
                                    }
                                    alt={banner.title}
                                    fill
                                    priority={isFirst}
                                    loading={isFirst ? 'eager' : 'lazy'}
                                    sizes="100vw"
                                    placeholder={placeholder?.base64 ? 'blur' : 'empty'}
                                    blurDataURL={placeholder?.base64}
                                    className="object-cover object-center transform-gpu select-none"
                                />

                                {/* Optimized Multi-stop Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 pointer-events-none" />

                                {/* Text Content */}
                                <div className="relative z-20 flex h-full flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                                    <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-emerald-300 uppercase bg-emerald-950/60 rounded-full border border-emerald-500/30 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        SMP Negeri 24 Padang
                                    </span>
                                    <h2 className="font-headline text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-700">
                                        {banner.title}
                                    </h2>
                                    {banner.description && (
                                        <p className="mt-3 max-w-2xl text-sm sm:text-base lg:text-lg text-white/90 drop-shadow-sm font-normal line-clamp-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            {banner.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CarouselItem>
                    );
                })}
            </CarouselContent>

            {/* Navigation Buttons (Desktop) */}
            {count > 1 && (
                <>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-11 w-11 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-all duration-200 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-11 w-11 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-all duration-200 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100" />

                    {/* Pagination Dots Indicator */}
                    <div className="absolute bottom-5 left-0 right-0 z-30 flex items-center justify-center gap-2">
                        {Array.from({ length: count }).map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => scrollTo(idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={cn(
                                    'h-2 rounded-full transition-all duration-300 transform-gpu',
                                    current === idx
                                        ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                                        : 'w-2 bg-white/50 hover:bg-white/80'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </Carousel>
    );
}