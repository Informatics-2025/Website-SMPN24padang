'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const AUTO_PLAY_MS = 3000;

export function ClientCarousel({ banners }: ClientCarouselProps) {
    const total = banners.length;
    const typedPlaceholders = placeholders as Array<{ src: string; base64: string }>;

    // Current visible index
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isPausedRef = useRef(false);

    const prev = useCallback(() => {
        setIndex((i) => (i - 1 + total) % total);
    }, [total]);

    const next = useCallback(() => {
        setIndex((i) => (i + 1) % total);
    }, [total]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (total <= 1 || isPausedRef.current) return;
        // Reverse direction: go prev (right-to-left visual feel)
        timerRef.current = setTimeout(() => {
            prev();
        }, AUTO_PLAY_MS);
    }, [prev, total]);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [startTimer, index]);

    const handlePrev = () => {
        prev();
    };

    const handleNext = () => {
        next();
    };

    const handleMouseEnter = () => {
        isPausedRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleMouseLeave = () => {
        isPausedRef.current = false;
        startTimer();
    };

    if (!banners || total === 0) return null;

    return (
        <div
            className="relative h-[42vh] w-full sm:h-[60vh] lg:h-[72vh] overflow-hidden group bg-black"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/*
              Each slide sits absolute, full-size.
              We use a CSS trick: the "slider track" div moves via transform.
              All slides are laid out horizontally, track width = total * 100%.
              We translate the track by -(index * (100% / total)) so current slide is visible.
              transition: transform with cubic-bezier for silky smooth 60fps.
            */}
            <div
                className="absolute inset-0 flex"
                style={{
                    width: `${total * 100}%`,
                    transform: `translateX(-${(index * 100) / total}%)`,
                    transition: `transform 700ms cubic-bezier(0.55, 0, 0.1, 1)`,
                    willChange: 'transform',
                }}
            >
                {banners.map((banner, i) => {
                    const placeholder = typedPlaceholders.find((p) => p.src === banner.imageUrl);
                    return (
                        <div
                            key={banner.id}
                            className="relative h-full overflow-hidden"
                            style={{ width: `${100 / total}%` }}
                        >
                            <Image
                                src={banner.imageUrl || 'https://placehold.co/1920x1080.png'}
                                alt={banner.title}
                                fill
                                priority={i === 0}
                                loading={i === 0 ? 'eager' : 'lazy'}
                                sizes="100vw"
                                placeholder={placeholder?.base64 ? 'blur' : 'empty'}
                                blurDataURL={placeholder?.base64}
                                className="object-cover object-center select-none pointer-events-none"
                                draggable={false}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15 pointer-events-none" />
                        </div>
                    );
                })}
            </div>

            {/* Text overlay — always on top, updates with index */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8 pointer-events-none">
                <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-emerald-300 uppercase bg-emerald-950/60 rounded-full border border-emerald-500/30 shadow-sm">
                    SMP Negeri 24 Padang
                </span>
                <h2 className="font-headline text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl transition-opacity duration-300">
                    {banners[index].title}
                </h2>
                {banners[index].description && (
                    <p className="mt-3 max-w-2xl text-sm sm:text-base lg:text-lg text-white/90 drop-shadow-sm font-normal line-clamp-3">
                        {banners[index].description}
                    </p>
                )}
            </div>

            {/* Prev / Next buttons */}
            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Slide sebelumnya"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm
                                   transition-[background-color,border-color,transform,opacity] duration-200
                                   hover:bg-emerald-600 hover:border-emerald-500 hover:scale-105 active:scale-95
                                   opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Slide berikutnya"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm
                                   transition-[background-color,border-color,transform,opacity] duration-200
                                   hover:bg-emerald-600 hover:border-emerald-500 hover:scale-105 active:scale-95
                                   opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-5 left-0 right-0 z-30 flex items-center justify-center gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setIndex(idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={cn(
                                    'h-2 rounded-full transition-[width,background-color] duration-300',
                                    index === idx
                                        ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/60'
                                        : 'w-2 bg-white/50 hover:bg-white/80'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}