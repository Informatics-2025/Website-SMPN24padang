'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type Facility = {
    id: string;
    name: string;
    imageUrl?: string;
    description?: string;
};

type Placeholder = {
    src: string;
    base64: string;
};

type Props = {
    facilities: Facility[];
    placeholders: Placeholder[];
};

// Skeleton Loading Component
function SkeletonLoader(): ReactNode {
    return (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-pulse" />
    );
}

// Image Card Component with Optimized Loading - Mobile
interface FacilityCardProps {
    facility: Facility;
    placeholder?: Placeholder;
}

function FacilityCard({ facility, placeholder }: FacilityCardProps): ReactNode {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const src: string = facility.imageUrl ?? 'https://placehold.co/300x200.png';

    return (
        <div className="relative overflow-hidden rounded-lg h-40 bg-slate-100 dark:bg-slate-800">
            <Link href="/gallery" className="absolute inset-0 block">
                {/* Loading Skeleton */}
                {isLoading && <SkeletonLoader />}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Actual Image - Next.js optimized */}
                {!error && (
                    <Image
                        alt={facility.name}
                        src={src}
                        fill
                        className={`object-cover transition-all duration-300 ease-out ${
                            isLoading ? 'opacity-0' : 'opacity-100'
                        } active:scale-105`}
                        sizes="(max-width: 640px) 50vw, 400px"
                        placeholder={placeholder ? 'blur' : 'empty'}
                        blurDataURL={placeholder?.base64}
                        loading="lazy"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setError(true);
                        }}
                        priority={false}
                    />
                )}

                {error && (
                    <div className="w-full h-full flex items-center justify-center bg-slate-300 dark:bg-slate-700">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            Gagal memuat
                        </span>
                    </div>
                )}

                {/* Text Content */}
                <div className="absolute inset-0 z-20 flex items-end p-2 pointer-events-none">
                    <h3 className="font-headline text-sm font-bold text-white drop-shadow-lg line-clamp-2">
                        {facility.name}
                    </h3>
                </div>
            </Link>
        </div>
    );
}

// Desktop Card Component
function FacilityCardDesktop({
    facility,
    placeholder,
}: FacilityCardProps): ReactNode {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const src: string = facility.imageUrl ?? 'https://placehold.co/600x400.png';

    return (
        <div className="relative overflow-hidden rounded-lg shadow-sm bg-slate-100 dark:bg-slate-800">
            <Link
                href="/gallery"
                className="group relative overflow-hidden rounded-lg block"
            >
                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-pulse z-0" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Actual Image - Next.js optimized */}
                {!error && (
                    <div className="h-48 sm:h-56 md:h-40 lg:h-48 w-full relative">
                        <Image
                            alt={facility.name}
                            src={src}
                            fill
                            className={`object-cover transition-all duration-300 ease-out ${
                                isLoading ? 'opacity-0' : 'opacity-100'
                            } group-hover:scale-105`}
                            sizes="(max-width: 768px) 50vw, 25vw"
                            placeholder={placeholder ? 'blur' : 'empty'}
                            blurDataURL={placeholder?.base64}
                            loading="lazy"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setError(true);
                            }}
                            priority={false}
                        />
                    </div>
                )}

                {error && (
                    <div className="h-48 sm:h-56 md:h-40 lg:h-48 w-full flex items-center justify-center bg-slate-300 dark:bg-slate-700">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            Gagal memuat
                        </span>
                    </div>
                )}

                {/* Text Content */}
                <div className="absolute inset-0 z-20 flex items-end p-4 pointer-events-none">
                    <h3 className="font-headline text-sm sm:text-base md:text-sm lg:text-base font-bold text-white drop-shadow-lg">
                        {facility.name}
                    </h3>
                </div>
            </Link>
        </div>
    );
}

export default function Facilities({
    facilities,
    placeholders,
}: Props): ReactNode {
    const containerRef = useRef<HTMLDivElement>(null);

    // Reduce layout thrashing with requestAnimationFrame
    useEffect((): (() => void) => {
        const container = containerRef.current;
        if (!container) return () => {};

        let isScrolling = false;
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const handleScroll = (): void => {
            if (!isScrolling) {
                isScrolling = true;
                container.style.willChange = 'scroll-position';
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout((): void => {
                isScrolling = false;
                container.style.willChange = 'auto';
            }, 150);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return (): void => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    // Limit items for mobile
    const items: Facility[] = facilities.slice(0, 10);

    return (
        <section className="py-16 md:py-24 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">
                        Fasilitas Sekolah
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-foreground">
                        Lingkungan belajar yang lengkap dan modern untuk
                        mendukung potensi siswa.
                    </p>
                </div>

                {/* DESKTOP grid */}
                <div className="hidden md:grid md:grid-cols-4 sm:grid-cols-2 gap-4 mt-8">
                    {facilities.map((facility: Facility): ReactNode => {
                        const placeholder: Placeholder | undefined =
                            placeholders.find(
                                (p: Placeholder): boolean =>
                                    p.src === facility.imageUrl,
                            );
                        return (
                            <FacilityCardDesktop
                                key={facility.id}
                                facility={facility}
                                placeholder={placeholder}
                            />
                        );
                    })}
                </div>

                {/* MOBILE grid 2 kolom */}
                <div className="md:hidden mt-6">
                    <div
                        ref={containerRef}
                        className="grid grid-cols-2 gap-3"
                        style={{
                            contain: 'layout style paint',
                        }}
                    >
                        {items.map((facility: Facility): ReactNode => {
                            const placeholder: Placeholder | undefined =
                                placeholders.find(
                                    (p: Placeholder): boolean =>
                                        p.src === facility.imageUrl,
                                );
                            return (
                                <FacilityCard
                                    key={facility.id}
                                    facility={facility}
                                    placeholder={placeholder}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* View All Button */}
                <div className="mt-8 text-center">
                    <Button asChild>
                        <Link href="/gallery">Lihat Semua Fasilitas</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
