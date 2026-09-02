'use client';

import { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

type MonsterBackgroundProps = {
    className?: string;
    animationUrl?: string;
    parallaxStrength?: number; // default 20
    blur?: boolean; // default true
};

// Default ke animasi monster open-source. Jika gagal dimuat, akan fallback ke emoji.
const DEFAULT_ANIMATION_URL =
    'https://assets9.lottiefiles.com/packages/lf20_vbwbj5zj.json';

export default function MonsterBackground({
    className = '',
    animationUrl = DEFAULT_ANIMATION_URL,
    parallaxStrength = 20,
    blur = true,
}: MonsterBackgroundProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animRef = useRef<AnimationItem | null>(null);
    const [failed, setFailed] = useState(false);
    const rafRef = useRef<number | null>(null);
    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        let cancelled = false;

        // Prefetch JSON agar bisa handle error dan cache-friendly
        fetch(animationUrl)
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to load animation');
                return res.json();
            })
            .then((data) => {
                if (cancelled || !containerRef.current) return;
                animRef.current = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: data,
                });
            })
            .catch(() => {
                setFailed(true);
            });

        return () => {
            cancelled = true;
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }
        };
    }, [animationUrl]);

    // Parallax halus mengikuti mouse
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * parallaxStrength;
            const y = (e.clientY / innerHeight - 0.5) * parallaxStrength;
            targetRef.current = { x, y };
            schedule();
        };

        const schedule = () => {
            if (rafRef.current) return;
            const step = () => {
                // Interpolasi ke target (easing)
                currentRef.current.x +=
                    (targetRef.current.x - currentRef.current.x) * 0.08;
                currentRef.current.y +=
                    (targetRef.current.y - currentRef.current.y) * 0.08;
                if (containerRef.current) {
                    containerRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0) scale(1.05)`;
                }
                rafRef.current = requestAnimationFrame(step);
            };
            rafRef.current = requestAnimationFrame(step);
        };

        window.addEventListener('mousemove', onMove);
        return () => {
            window.removeEventListener('mousemove', onMove);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [parallaxStrength]);

    return (
        <div
            className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}
        >
            <div
                className={`absolute inset-0 flex items-center justify-center ${
                    blur ? 'blur-[1px]' : ''
                }`}
            >
                <div
                    className="w-[56vmin] h-[56vmin] max-w-[640px] max-h-[640px] min-w-[260px] min-h-[260px] opacity-90"
                    style={{ willChange: 'transform' }}
                    ref={containerRef}
                    aria-hidden="true"
                />
            </div>

            {failed && (
                <div className="absolute inset-0 flex items-center justify-center opacity-90">
                    <div
                        className="rounded-full shadow-xl w-[56vmin] h-[56vmin] max-w-[640px] max-h-[640px] min-w-[260px] min-h-[260px] overflow-hidden animate-[spin_90s_linear_infinite]"
                        style={{
                            backgroundImage:
                                "url('https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        aria-hidden="true"
                    />
                </div>
            )}

            {/* Vignette lembut agar depth lebih terasa */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-white/5" />
        </div>
    );
}
