'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import * as Collapsible from '@radix-ui/react-collapsible';

import {
    Home,
    User,
    Trophy,
    Camera,
    Menu,
    Phone,
    Mail,
    ChevronDown,
    Target,
    Users,
    Award,
    Network,
    MapPin,
    Newspaper,
    Shirt,
    GraduationCap,
    ShieldCheck,
    Megaphone,
    Recycle,
    Youtube,
    YoutubeIcon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

type ContactInfo = {
    address: string;
    phone: string;
    email: string;
};

type HeaderProps = {
    contactInfo: ContactInfo | null;
};

export default function Header({ contactInfo }: HeaderProps) {
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [pinnedDropdown, setPinnedDropdown] = useState<string | null>(null);
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Beranda', icon: Home },
        {
            href: '/profile',
            label: 'Profil',
            icon: User,
            subLinks: [
                { href: '/profile', label: 'Profil Sekolah', icon: User },
                {
                    href: '/profile/vision-mission',
                    label: 'Visi & Misi',
                    icon: Target,
                },
                {
                    href: '/profile/organization-structure',
                    label: 'Struktur Organisasi',
                    icon: Network,
                },
                {
                    href: '/profile/curriculum',
                    label: 'Kurikulum',
                    icon: GraduationCap,
                },
                {
                    href: '/profile/accreditation',
                    label: 'Sertifikasi & Penghargaan',
                    icon: Award,
                },
                {
                    href: '/profile/uniform',
                    label: 'Seragam Sekolah',
                    icon: Shirt,
                },
            ],
        },
        { href: '/profile/faculty', label: 'Guru & Staf', icon: Users },
        {
            href: '/publications',
            label: 'Publikasi',
            icon: Newspaper,
            subLinks: [
                { href: '/news', label: 'Berita', icon: Newspaper },
                { href: '/pengumuman', label: 'Pengumuman', icon: Megaphone },
                { href: '/sispendik', label: 'Sispendig', icon: Recycle },
            ],
        },
        { href: '/achievements', label: 'Prestasi', icon: Trophy },
        {
            href: '/gallery',
            label: 'Galeri',
            icon: Camera,
            subLinks: [
                { href: '/gallery', label: 'Galeri Foto', icon: Camera },
                { href: '/videos', label: 'Galeri Video', icon: YoutubeIcon },
            ],
        },
        { href: '/contact', label: 'Kontak', icon: Phone },
    ];

    const cleanPathname = pathname;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            {/* Top Bar for Contact Info */}
            <div className="hidden bg-primary/90 text-primary-foreground lg:block">
                <div className="container mx-auto flex h-8 items-center justify-between px-4 text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="font-semibold">
                            CERDAS, TERAMPIL, DAN BERBUDAYA LINGKUNGAN
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href={`tel:${contactInfo?.phone}`}
                            className="flex items-center gap-2 transition-colors hover:text-white/80"
                        >
                            <Phone className="h-4 w-4" />
                            <span>{contactInfo?.phone}</span>
                        </a>
                        <a
                            href={`mailto:${contactInfo?.email}`}
                            className="flex items-center gap-2 transition-colors hover:text-white/80"
                        >
                            <Mail className="h-4 w-4" />
                            <span>{contactInfo?.email}</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto flex h-16 items-center px-4">
                <Link
                    href="/"
                    className="mr-6 flex flex-shrink-0 items-center gap-2 p-2 rounded-md"
                >
                    <Image
                        src="/logo.png"
                        alt="SMP Negeri 24 Padang Logo"
                        width={40}
                        height={40}
                        className="h-8 w-auto"
                    />
                    <span className="font-headline text-lg md:text-xl font-bold text-primary">
                        SMP Negeri 24 Padang
                    </span>
                </Link>

                <div className="flex w-full items-center justify-end">
                    {/* Desktop Navigation */}
                    <nav className="items-center justify-end gap-4 hidden md:flex">
                        {navLinks.map((link) => {
                            const isDropdownActive =
                                link.subLinks &&
                                link.subLinks.some(
                                    (sub) => pathname === sub.href,
                                );
                            const isLinkActive =
                                (link.href === '/' && pathname === '/') ||
                                (link.href !== '/' &&
                                    pathname.startsWith(link.href) &&
                                    !link.subLinks) ||
                                (link.href === '/news' &&
                                    pathname.startsWith('/articles'));

                            return link.subLinks ? (
                                <div
                                    className="relative"
                                    key={link.href}
                                    onMouseEnter={() =>
                                        setOpenDropdown(link.href)
                                    }
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <DropdownMenu
                                        open={
                                            openDropdown === link.href ||
                                            pinnedDropdown === link.href
                                        }
                                        onOpenChange={(isOpen) => {
                                            if (!isOpen) {
                                                if (
                                                    pinnedDropdown === link.href
                                                ) {
                                                    setPinnedDropdown(null);
                                                }
                                                if (
                                                    openDropdown === link.href
                                                ) {
                                                    setOpenDropdown(null);
                                                }
                                            }
                                        }}
                                    >
                                        <DropdownMenuTrigger
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (
                                                    pinnedDropdown === link.href
                                                ) {
                                                    setPinnedDropdown(null);
                                                } else {
                                                    setPinnedDropdown(
                                                        link.href,
                                                    );
                                                    setOpenDropdown(null);
                                                }
                                            }}
                                            className={cn(
                                                'flex items-center rounded-md px-3 py-2 text-base lg:text-lg font-semibold transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none',
                                                isDropdownActive
                                                    ? 'font-bold text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {link.label}{' '}
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[280px] bg-white rounded-xl shadow-lg p-2">
                                            {link.subLinks.map((subLink) => {
                                                const isSubLinkActive =
                                                    pathname === subLink.href;
                                                return (
                                                    <DropdownMenuItem
                                                        key={subLink.href}
                                                        asChild
                                                        className={cn(
                                                            'py-2 border-b border-gray-200 last:border-b-0',
                                                        )}
                                                    >
                                                        <Link
                                                            href={subLink.href}
                                                            className={cn(
                                                                'flex items-center gap-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2',
                                                                isSubLinkActive &&
                                                                    'text-primary',
                                                            )}
                                                        >
                                                            <subLink.icon className="h-5 w-5" />
                                                            {subLink.label}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                );
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'relative text-base lg:text-lg font-semibold transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-center after:bg-primary after:transition-transform after:duration-300 after:ease-in-out',
                                        isLinkActive
                                            ? 'font-bold text-foreground'
                                            : 'text-muted-foreground after:scale-x-0 hover:text-primary hover:after:scale-x-100',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-4">
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="z-50"
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">
                                        Open navigation menu
                                    </span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="flex flex-col p-0"
                            >
                                <div className="border-b p-6">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2"
                                        onClick={() => setSheetOpen(false)}
                                    >
                                        <Image
                                            src="/logo.png"
                                            alt="SMP Negeri 24 Padang Logo"
                                            width={40}
                                            height={40}
                                            className="h-8 w-auto"
                                        />
                                        <span className="font-headline text-xl font-bold text-primary">
                                            SMP Negeri 24 Padang
                                        </span>
                                    </Link>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="flex flex-col gap-4">
                                        {navLinks.map((link) =>
                                            !link.subLinks ? (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() =>
                                                        setSheetOpen(false)
                                                    }
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-md p-2 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground',
                                                        (cleanPathname.startsWith(
                                                            link.href,
                                                        ) ||
                                                            (link.href ===
                                                                '/news' &&
                                                                cleanPathname.startsWith(
                                                                    '/articles',
                                                                ))) &&
                                                            '',
                                                    )}
                                                >
                                                    <link.icon className="h-5 w-5" />
                                                    {link.label}
                                                </Link>
                                            ) : (
                                                <Collapsible.Root
                                                    key={link.href}
                                                    asChild
                                                >
                                                    <div className="flex flex-col group">
                                                        <Collapsible.Trigger className="flex w-full items-center justify-between rounded-md p-2 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
                                                            <div className="flex items-center gap-3">
                                                                <link.icon className="h-5 w-5" />
                                                                {link.label}
                                                            </div>
                                                            <ChevronDown className="h-5 w-5 transition-transform duration-200 ease-in-out group-data-[state=open]:-rotate-180" />
                                                        </Collapsible.Trigger>
                                                        <Collapsible.Content className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                                            <div className="flex flex-col py-3 pl-10">
                                                                {link.subLinks.map(
                                                                    (
                                                                        subLink,
                                                                    ) => (
                                                                        <Link
                                                                            key={
                                                                                subLink.href
                                                                            }
                                                                            href={
                                                                                subLink.href
                                                                            }
                                                                            onClick={() =>
                                                                                setSheetOpen(
                                                                                    false,
                                                                                )
                                                                            }
                                                                            className={cn(
                                                                                'flex items-center gap-3 rounded-md p-3 text-lg font-semibold text-foreground hover:bg-accent hover:text-accent-foreground border-b border-gray-200 last:border-b-0',
                                                                                cleanPathname ===
                                                                                    subLink.href &&
                                                                                    '',
                                                                            )}
                                                                        >
                                                                            <subLink.icon className="h-5 w-5" />
                                                                            {
                                                                                subLink.label
                                                                            }
                                                                        </Link>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </Collapsible.Content>
                                                    </div>
                                                </Collapsible.Root>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="border-t p-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 rounded-md p-2 text-base font-medium text-foreground">
                                            <MapPin className="h-5 w-5" />
                                            <span>{contactInfo?.address}</span>
                                        </div>
                                        <a
                                            href={`tel:${contactInfo?.phone}`}
                                            className="flex items-center gap-3 rounded-md p-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <Phone className="h-5 w-5" />
                                            <span>{contactInfo?.phone}</span>
                                        </a>
                                        <a
                                            href={`mailto:${contactInfo?.email}`}
                                            className="flex items-center gap-3 rounded-md p-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <Mail className="h-5 w-5" />
                                            <span>{contactInfo?.email}</span>
                                        </a>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
