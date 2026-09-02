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
const TRANSITION = 'transform 650ms cubic-bezier(0.4, 0, 0.2, 1)';

export function ClientCarousel({ banners }: ClientCarouselProps) {
    const total = banners.length;
    const typedPlaceholders = placeholders as Array<{ src: string; base64: string }>;

    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isPausedRef = useRef(false);
    const indexRef = useRef(0);
    indexRef.current = index;

    const prev = useCallback(() => {
        setIndex((i) => (i - 1 + total) % total);
    }, [total]);

    const goNext = useCallback(() => {
        setIndex((i) => (i + 1) % total);
    }, [total]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (total <= 1 || isPausedRef.current) return;
        timerRef.current = setTimeout(prev, AUTO_PLAY_MS);
    }, [prev, total]);

    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [resetTimer, index]);

    if (!banners || total === 0) return null;

    return (
        <div
            className="relative w-full overflow-hidden group"
            style={{ aspectRatio: '21/8' }}
            onMouseEnter={() => { isPausedRef.current = true; if (timerRef.current) clearTimeout(timerRef.current); }}
            onMouseLeave={() => { isPausedRef.current = false; resetTimer(); }}
        >
            {/* Slide strip - GPU composited */}
            <div
                className="absolute inset-0 flex"
                style={{
                    width: `${total * 100}%`,
                    transform: `translateX(${-(index / total) * 100}%)`,
                    transition: TRANSITION,
                    willChange: 'transform',
                    contain: 'layout style',
                }}
            >
                {banners.map((banner, i) => {
                    const placeholder = typedPlaceholders.find((p) => p.src === banner.imageUrl);
                    return (
                        <div
                            key={banner.id}
                            className="relative h-full"
                            style={{ width: `${100 / total}%`, contain: 'strict' }}
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
                        </div>
                    );
                })}
            </div>

            {/* Gradient overlay - separate layer, no transition */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 pointer-events-none" style={{ zIndex: 10 }} />

            {/* Text - separate composite layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8 pointer-events-none" style={{ zIndex: 20 }}>
                <span className="inline-block px-3 py-1 mb-3 text-[10px] sm:text-xs font-semibold tracking-wider text-emerald-300 uppercase bg-emerald-950/60 rounded-full border border-emerald-500/30 shadow-sm">
                    SMP Negeri 24 Padang
                </span>
                <h2 className="font-headline text-xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
                    {banners[index].title}
                </h2>
                {banners[index].description && (
                    <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-base lg:text-lg text-white/90 drop-shadow-sm font-normal line-clamp-2 sm:line-clamp-3">
                        {banners[index].description}
                    </p>
                )}
            </div>

            {/* Controls */}
            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => { prev(); resetTimer(); }}
                        aria-label="Slide sebelumnya"
                        style={{ zIndex: 30 }}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-[2px] transition-[background-color,transform,opacity] duration-200 hover:bg-emerald-600 hover:border-emerald-500 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => { goNext(); resetTimer(); }}
                        aria-label="Slide berikutnya"
                        style={{ zIndex: 30 }}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-[2px] transition-[background-color,transform,opacity] duration-200 hover:bg-emerald-600 hover:border-emerald-500 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 flex items-center justify-center gap-2" style={{ zIndex: 30 }}>
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setIndex(idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={cn(
                                    'h-1.5 rounded-full transition-[width,background-color] duration-300',
                                    index === idx
                                        ? 'w-6 sm:w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}