'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
    Home,
    School,
    Target,
    Network,
    GraduationCap,
    Award,
    Shirt,
    Users,
    Newspaper,
    Megaphone,
    Recycle,
    Trophy,
    Camera,
    Video,
    Phone,
    Mail,
    ChevronDown,
    ShieldCheck,
    Menu,
    MapPin,
    Sparkles,
} from 'lucide-react';

type ContactInfo = {
    address: string;
    phone: string;
    email: string;
};

type HeaderProps = {
    contactInfo: ContactInfo | null;
};

type SubLink = {
    href: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

type NavLink = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    subLinks?: SubLink[];
};

export default function Header({ contactInfo }: HeaderProps) {
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setActiveDropdown(null);
        setSheetOpen(false);
    }, [pathname]);

    const handleMouseEnter = (href: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveDropdown(href);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    const toggleDropdownClick = (href: string) => {
        if (activeDropdown === href) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(href);
        }
    };

    const navLinks: NavLink[] = [
        {
            href: '/',
            label: 'Beranda',
            icon: Home,
        },
        {
            href: '/profile',
            label: 'Profil',
            icon: School,
            subLinks: [
                {
                    href: '/profile',
                    label: 'Profil Sekolah',
                    description: 'Informasi umum & sejarah sekolah',
                    icon: School,
                },
                {
                    href: '/profile/vision-mission',
                    label: 'Visi & Misi',
                    description: 'Visi cerdas, terampil & berbudaya',
                    icon: Target,
                },
                {
                    href: '/profile/organization-structure',
                    label: 'Struktur Organisasi',
                    description: 'Bagan pimpinan & tata kelola',
                    icon: Network,
                },
                {
                    href: '/profile/curriculum',
                    label: 'Kurikulum',
                    description: 'Kurikulum merdeka & program ajar',
                    icon: GraduationCap,
                },
                {
                    href: '/profile/accreditation',
                    label: 'Sertifikasi Akreditasi',
                    description: 'Akreditasi & sertifikat resmi',
                    icon: Award,
                },
                {
                    href: '/profile/uniform',
                    label: 'Seragam Sekolah',
                    description: 'Panduan tata tertib busana siswa',
                    icon: Shirt,
                },
            ],
        },
        {
            href: '/profile/faculty',
            label: 'Guru & Staf',
            icon: Users,
        },
        {
            href: '/publications',
            label: 'Publikasi',
            icon: Newspaper,
            subLinks: [
                {
                    href: '/news',
                    label: 'Berita',
                    description: 'Kabar terkini & liputan kegiatan',
                    icon: Newspaper,
                },
                {
                    href: '/pengumuman',
                    label: 'Pengumuman',
                    description: 'Agenda resmi & info akademik',
                    icon: Megaphone,
                },
                {
                    href: '/sispendik',
                    label: 'Sispendig',
                    description: 'Bank Sampah & Pengelolaan Digital',
                    icon: Recycle,
                },
            ],
        },
        {
            href: '/achievements',
            label: 'Prestasi',
            icon: Trophy,
        },
        {
            href: '/gallery',
            label: 'Galeri',
            icon: Camera,
            subLinks: [
                {
                    href: '/gallery',
                    label: 'Galeri Foto',
                    description: 'Dokumentasi foto kegiatan',
                    icon: Camera,
                },
                {
                    href: '/videos',
                    label: 'Galeri Video',
                    description: 'Tayangan video profil & acara',
                    icon: Video,
                },
            ],
        },
        {
            href: '/contact',
            label: 'Kontak',
            icon: Phone,
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300">
            {/* Top Bar for Contact Info with Emerald Acrylic Gradient */}
            <div className="hidden lg:block bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-emerald-50 text-xs py-1.5 border-b border-emerald-700/40 shadow-inner">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-medium tracking-wide">
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        <span>CERDAS, TERAMPIL, DAN BERBUDAYA LINGKUNGAN</span>
                    </div>
                    <div className="flex items-center gap-5">
                        {contactInfo?.phone && (
                            <a
                                href={`tel:${contactInfo.phone}`}
                                className="flex items-center gap-1.5 transition-colors hover:text-emerald-200"
                            >
                                <Phone className="h-3.5 w-3.5 text-emerald-300" />
                                <span>{contactInfo.phone}</span>
                            </a>
                        )}
                        {contactInfo?.email && (
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className="flex items-center gap-1.5 transition-colors hover:text-emerald-200"
                            >
                                <Mail className="h-3.5 w-3.5 text-emerald-300" />
                                <span>{contactInfo.email}</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Acrylic Navbar Container */}
            <div
                className={cn(
                    'w-full border-b transition-[background-color,box-shadow,padding] duration-300 will-change-auto',
                    isScrolled
                        ? 'bg-background/90 dark:bg-background/90 backdrop-blur-md border-emerald-500/20 shadow-[0_4px_16px_rgb(0,0,0,0.06)] py-2'
                        : 'bg-background/80 dark:bg-background/80 backdrop-blur-sm border-emerald-500/15 py-2.5'
                )}
            >
                <div className="container mx-auto flex items-center justify-between px-4">
                    {/* Brand Logo & Name */}
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 rounded-xl p-1.5 transition-all duration-200 hover:bg-emerald-500/10"
                    >
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 p-1 border border-emerald-500/20 shadow-sm transition-transform duration-200 group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="SMP Negeri 24 Padang Logo"
                                width={36}
                                height={36}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                SMPN 24 Padang
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                                Kota Padang, Sumatera Barat
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
                        <nav className="flex items-center gap-1 lg:gap-1.5">
                            {navLinks.map((link) => {
                                const isDropdownActive =
                                    link.subLinks &&
                                    link.subLinks.some((sub) => pathname === sub.href);
                                const isLinkActive =
                                    (link.href === '/' && pathname === '/') ||
                                    (link.href !== '/' &&
                                        pathname.startsWith(link.href) &&
                                        !link.subLinks) ||
                                    (link.href === '/news' &&
                                        pathname.startsWith('/articles')) ||
                                    isDropdownActive;

                                const isDropdownOpen = activeDropdown === link.href;

                                if (link.subLinks) {
                                    return (
                                        <div
                                            key={link.href}
                                            className="relative"
                                            onMouseEnter={() => handleMouseEnter(link.href)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleDropdownClick(link.href)}
                                                className={cn(
                                                    'group flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs lg:text-sm font-semibold transition-all duration-200',
                                                    isDropdownOpen || isLinkActive
                                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                                                        : 'text-foreground/85 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300'
                                                )}
                                                aria-expanded={isDropdownOpen}
                                            >
                                                <link.icon
                                                    className={cn(
                                                        'h-4 w-4 transition-colors',
                                                        isDropdownOpen || isLinkActive
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                                                    )}
                                                />
                                                <span>{link.label}</span>
                                                <ChevronDown
                                                    className={cn(
                                                        'h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
                                                        isDropdownOpen && '-rotate-180 text-emerald-600 dark:text-emerald-400'
                                                    )}
                                                />
                                            </button>

                                            {/* Dropdown – GPU-composited, no layout-triggering props */}
                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 4 }}
                                                        transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                                                        style={{ willChange: 'opacity, transform' }}
                                                        className="absolute left-0 top-full pt-2 z-50 min-w-[280px] transform-gpu"
                                                        onMouseEnter={() => handleMouseEnter(link.href)}
                                                        onMouseLeave={handleMouseLeave}
                                                    >
                                                        <div className="rounded-2xl border border-emerald-500/25 bg-background p-2 shadow-2xl ring-1 ring-border/50">
                                                            <div className="flex flex-col gap-1">
                                                                {link.subLinks.map((subLink) => {
                                                                    const isSubActive = pathname === subLink.href;
                                                                    const SubIcon = subLink.icon;
                                                                    return (
                                                                        <Link
                                                                            key={subLink.href}
                                                                            href={subLink.href}
                                                                            className={cn(
                                                                                'group flex items-start gap-3 rounded-xl p-2.5 text-xs transition-[background-color,border-color] duration-150',
                                                                                isSubActive
                                                                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
                                                                                    : 'hover:bg-emerald-500/10 text-foreground'
                                                                            )}
                                                                        >
                                                                            <div
                                                                                className={cn(
                                                                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                                                                                    isSubActive
                                                                                        ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                                                        : 'border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/15'
                                                                                )}
                                                                            >
                                                                                <SubIcon className="h-4 w-4" />
                                                                            </div>
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span
                                                                                    className={cn(
                                                                                        'font-bold text-xs leading-tight',
                                                                                        isSubActive
                                                                                            ? 'text-emerald-800 dark:text-emerald-300'
                                                                                            : 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                                                                                    )}
                                                                                >
                                                                                    {subLink.label}
                                                                                </span>
                                                                                <span className="text-[11px] text-muted-foreground leading-tight">
                                                                                    {subLink.description}
                                                                                </span>
                                                                            </div>
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            'group flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs lg:text-sm font-semibold transition-all duration-200',
                                            isLinkActive
                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                                                : 'text-foreground/85 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300'
                                        )}
                                    >
                                        <link.icon
                                            className={cn(
                                                'h-4 w-4 transition-colors',
                                                isLinkActive
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                                            )}
                                        />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Theme Toggle Button */}
                        <div className="ml-2 pl-2 border-l border-emerald-500/20">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile Navigation Header Controls */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Buka Menu Navigasi</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[85vw] max-w-sm flex flex-col p-0 bg-background/95 backdrop-blur-2xl border-l border-emerald-500/25"
                            >
                                {/* Mobile Drawer Header */}
                                <div className="border-b border-emerald-500/20 p-4 bg-emerald-500/5">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2.5"
                                        onClick={() => setSheetOpen(false)}
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 p-1 border border-emerald-500/20">
                                            <Image
                                                src="/logo.png"
                                                alt="SMP Negeri 24 Padang Logo"
                                                width={32}
                                                height={32}
                                                className="h-7 w-auto"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">
                                                SMPN 24 Padang
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Menu Navigasi
                                            </span>
                                        </div>
                                    </Link>
                                </div>

                                {/* Mobile Drawer Nav Items */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                                    {navLinks.map((link) => {
                                        if (!link.subLinks) {
                                            const isActive =
                                                (link.href === '/' && pathname === '/') ||
                                                (link.href !== '/' && pathname.startsWith(link.href));
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setSheetOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-xl p-2.5 text-sm font-semibold transition-colors',
                                                        isActive
                                                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30'
                                                            : 'text-foreground/90 hover:bg-emerald-500/10 hover:text-emerald-700'
                                                    )}
                                                >
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        <link.icon className="h-4 w-4" />
                                                    </div>
                                                    <span>{link.label}</span>
                                                </Link>
                                            );
                                        }

                                        return (
                                            <Collapsible.Root key={link.href} asChild>
                                                <div className="flex flex-col rounded-xl border border-emerald-500/15 bg-card/40 p-1 group">
                                                    <Collapsible.Trigger className="flex w-full items-center justify-between rounded-lg p-2 text-sm font-semibold text-foreground hover:bg-emerald-500/10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                                <link.icon className="h-4 w-4" />
                                                            </div>
                                                            <span>{link.label}</span>
                                                        </div>
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 ease-in-out group-data-[state=open]:-rotate-180" />
                                                    </Collapsible.Trigger>
                                                    <Collapsible.Content className="overflow-hidden transition-all duration-300 ease-in-out">
                                                        <div className="flex flex-col gap-1 py-1.5 pl-3 pr-1 border-t border-emerald-500/15 mt-1">
                                                            {link.subLinks.map((subLink) => {
                                                                const isSubActive = pathname === subLink.href;
                                                                const SubIcon = subLink.icon;
                                                                return (
                                                                    <Link
                                                                        key={subLink.href}
                                                                        href={subLink.href}
                                                                        onClick={() => setSheetOpen(false)}
                                                                        className={cn(
                                                                            'flex items-center gap-2.5 rounded-lg p-2 text-xs font-medium transition-colors',
                                                                            isSubActive
                                                                                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold'
                                                                                : 'text-foreground/80 hover:bg-emerald-500/10 hover:text-emerald-700'
                                                                        )}
                                                                    >
                                                                        <SubIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                        <div className="flex flex-col">
                                                                            <span>{subLink.label}</span>
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </Collapsible.Content>
                                                </div>
                                            </Collapsible.Root>
                                        );
                                    })}
                                </div>

                                {/* Mobile Drawer Footer */}
                                {contactInfo && (
                                    <div className="border-t border-emerald-500/20 p-4 bg-emerald-500/5 space-y-2 text-xs">
                                        <div className="flex items-start gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                            <span className="line-clamp-2">{contactInfo.address}</span>
                                        </div>
                                        {contactInfo.phone && (
                                            <a
                                                href={`tel:${contactInfo.phone}`}
                                                className="flex items-center gap-2 text-foreground font-medium hover:text-emerald-600"
                                            >
                                                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>{contactInfo.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
