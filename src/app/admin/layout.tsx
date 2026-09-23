'use client';

import AdminHeader from '@/components/admin-header'; // Import AdminHeader
import { AdaptiveBreadcrumb } from '@/components/ui/adaptive-breadcrumb';
import { ThemeToggle } from '@/components/theme-toggle';

const ADMIN_BREADCRUMB_LABELS: Record<string, string> = {
    admin: 'Admin',
    dashboard: 'Dashboard',
    homepage: 'Beranda',
    profile: 'Profil',
    principal: 'Profil Sekolah',
    'vision-mission': 'Visi & Misi',
    organization: 'Struktur Organisasi',
    curriculum: 'Kurikulum',
    accreditation: 'Akreditasi',
    faculty: 'Guru & Tenaga Kependidikan',
    'past-principals': 'Kepala Sekolah Terdahulu',
    uniform: 'Aturan Seragam',
    achievements: 'Prestasi',
    news: 'Berita & Pengumuman',
    announcements: 'Pengumuman',
    articles: 'Artikel',
    gallery: 'Galeri',
    sispendik: 'Sispendik',
    'master-data': 'Master Data',
    faq: 'FAQ',
    contact: 'Pesan & Kontak',
    videos: 'Video Kegiatan',
    users: 'Manajemen Pengguna',
    comments: 'Komentar',
    banksampah: 'Bank Sampah',
    staff: 'Tenaga Kependidikan',
};
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import * as Collapsible from '@radix-ui/react-collapsible';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Archive,
    Award,
    GalleryHorizontal,
    Home,
    Image as ImageIcon,
    LayoutDashboard,
    LogOut, // Added for FAQ
    Megaphone,
    MessageCircleQuestion,
    MessageSquareTextIcon,
    Network,
    Newspaper,
    Phone,
    Recycle,
    Shirt,
    Target,
    Trophy,
    UserCircle,
    Users,
    Youtube,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    // Desktop: sidebar terbuka (dikontrol tombol). Mobile: sidebar tertutup (drawer).
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(true);
        }
        setIsMobileOpen(false);
    }, [isMobile]);

    // Tutup drawer mobile tiap kali pindah halaman
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Kunci scroll body saat drawer mobile terbuka agar halaman di belakang
    // tidak ikut bergeser (sidebar jadi tidak terlihat "mengambang").
    useEffect(() => {
        if (!(isMobile && isMobileOpen)) return;

        const { overflow, paddingRight } = document.body.style;
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            document.body.style.overflow = overflow;
            document.body.style.paddingRight = paddingRight;
        };
    }, [isMobile, isMobileOpen]);

    // Geser ke atas: kalau user menyentuh/scroll area konten saat mode mobile,
    // drawer otomatis tertutup.
    useEffect(() => {
        if (!(isMobile && isMobileOpen)) return;

        let startY = 0;
        let startX = 0;

        const onTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        };

        const onTouchMove = (e: TouchEvent) => {
            const dy = e.touches[0].clientY - startY;
            const dx = e.touches[0].clientX - startX;
            // Sengaja menyentuh/scroll konten (bukan gesture geser horizontal)
            if (Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [isMobile, isMobileOpen]);

    // Moved menuItems declaration before its usage
    const menuItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/homepage', label: 'Beranda', icon: Home },
        {
            label: 'Profil',
            icon: UserCircle,
            subItems: [
                {
                    href: '/admin/profile/principal',
                    label: 'Profil Sekolah',
                    icon: UserCircle,
                },

                {
                    href: '/admin/profile/vision-mission',
                    label: 'Visi & Misi',
                    icon: Target,
                },
                {
                    href: '/admin/organization',
                    label: 'Struktur Organisasi',
                    icon: Network,
                },
                {
                    href: '/admin/curriculum',
                    label: 'Kurikulum',
                    icon: Target,
                },
                {
                    href: '/admin/accreditation',
                    label: 'Sertifikasi Akreditasi',
                    icon: Award,
                },
                {
                    href: '/admin/profile/uniform',
                    label: 'Seragam',
                    icon: Shirt,
                },
            ],
        },
        { href: '/admin/staff', label: 'Guru & Staf', icon: Users },
        {
            label: 'Artikel',
            icon: Newspaper,
            subItems: [
                { href: '/admin/news', label: 'Berita', icon: Newspaper },
                {
                    href: '/admin/announcements',
                    label: 'Pengumuman',
                    icon: Megaphone,
                },
                { href: '/admin/sispendik', label: 'Sispendig', icon: Recycle },
                {
                    href: '/admin/banksampah',
                    label: 'Bank Sampah',
                    icon: Archive,
                },
            ],
        },
        { href: '/admin/achievements', label: 'Prestasi', icon: Trophy },
        {
            label: 'Galeri',
            icon: GalleryHorizontal,
            subItems: [
                {
                    href: '/admin/gallery',
                    label: 'Galeri Foto',
                    icon: ImageIcon,
                },
                { href: '/admin/videos', label: 'Galeri Video', icon: Youtube },
            ],
        },
        { href: '/admin/contact', label: 'Kontak', icon: Phone },
        { href: '/admin/faq', label: 'FAQ', icon: MessageCircleQuestion },
        {
            href: '/admin/comments',
            label: 'Komentar',
            icon: MessageSquareTextIcon,
        },
    ];

    const [collapsibleOpenStates, setCollapsibleOpenStates] = React.useState<
        boolean[]
    >(menuItems.map(() => false));

    const handleLogout = async () => {
        try {
            await signOut({ redirect: false });
            toast({ title: 'Sukses', description: 'Anda telah keluar.' });
            window.location.href = '/login';
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal untuk keluar.',
            });
        }
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                {/* Drawer container: fixed & full-height di mobile supaya sidebar
                    mengunci ke viewport, tidak ikut ter-scroll bersama halaman. */}
                <div
                    className={`fixed inset-y-0 left-0 z-50 h-dvh transition-transform duration-300 ease-in-out md:static md:h-auto md:translate-x-0 ${
                        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    } print:hidden`}
                >
                    {/* Overlay gelap hanya di mobile */}
                    <div
                        aria-hidden="true"
                        onClick={() => setIsMobileOpen(false)}
                        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${
                            isMobileOpen
                                ? 'opacity-100'
                                : 'pointer-events-none opacity-0'
                        }`}
                    />

                    <Sidebar
                        onTouchMove={(e) => e.stopPropagation()}
                        className={`relative z-10 h-full w-64 max-w-[85vw] md:transition-[width] ${
                            isSidebarOpen ? 'md:w-64' : 'md:w-20'
                        } print:hidden`}
                    >
                    <SidebarHeader>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-sm"
                                />
                                <span className="text-lg font-semibold text-white ml-1 group-data-[state=collapsed]:hidden">
                                    Admin
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/admin/profile"
                                    className="group-data-[state=collapsed]:hidden"
                                >
                                    <UserCircle className="h-6 w-6 text-white/70 hover:text-white transition-colors" />
                                </Link>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="overflow-y-auto flex-grow">
                        <SidebarMenu>
                            {menuItems.map((item, index) =>
                                item.subItems ? (
                                    <Collapsible.Root
                                        key={index}
                                        open={collapsibleOpenStates[index]}
                                        onOpenChange={(open) => {
                                            setCollapsibleOpenStates(
                                                (prev: boolean[]) => {
                                                    const newState = [...prev];
                                                    newState[index] = open;
                                                    return newState;
                                                },
                                            );
                                        }}
                                        asChild
                                    >
                                        <SidebarMenuItem>
                                            <Collapsible.Trigger asChild>
                                                <SidebarMenuButton
                                                    icon={item.icon}
                                                    isActive={item.subItems.some(
                                                        (sub) =>
                                                            pathname.startsWith(
                                                                sub.href,
                                                            ),
                                                    )}
                                                    isCollapsibleTrigger={true}
                                                    isMenuOpen={
                                                        collapsibleOpenStates[
                                                            index
                                                        ]
                                                    }
                                                >
                                                    {item.label}
                                                </SidebarMenuButton>
                                            </Collapsible.Trigger>
                                            <AnimatePresence>
                                                {collapsibleOpenStates[
                                                    index
                                                ] && (
                                                    <Collapsible.Content
                                                        asChild
                                                        forceMount
                                                    >
                                                        <motion.ul
                                                            initial={{
                                                                opacity: 0,
                                                                height: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                height: 'auto',
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                height: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.3,
                                                                ease: 'easeInOut',
                                                            }}
                                                            className="pl-4 mt-1 overflow-hidden"
                                                        >
                                                            <SidebarMenuSub>
                                                                {item.subItems.map(
                                                                    (
                                                                        subItem,
                                                                    ) => (
                                                                        <SidebarMenuSubItem
                                                                            key={
                                                                                subItem.href
                                                                            }
                                                                        >
                                                                            <SidebarMenuSubButton
                                                                                href={
                                                                                    subItem.href
                                                                                }
                                                                                isActive={
                                                                                    pathname ===
                                                                                    subItem.href
                                                                                }
                                                                                onClick={() => {
                                                                                    if (
                                                                                        isMobile
                                                                                    ) {
                                                                                        setIsMobileOpen(
                                                                                            false,
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <span className="flex items-center">
                                                                                    {subItem.icon && (
                                                                                        <subItem.icon className="mr-2 h-4 w-4" />
                                                                                    )}
                                                                                    {
                                                                                        subItem.label
                                                                                    }
                                                                                </span>
                                                                            </SidebarMenuSubButton>
                                                                        </SidebarMenuSubItem>
                                                                    ),
                                                                )}
                                                            </SidebarMenuSub>
                                                        </motion.ul>
                                                    </Collapsible.Content>
                                                )}
                                            </AnimatePresence>
                                        </SidebarMenuItem>
                                    </Collapsible.Root>
                                ) : (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            href={item.href}
                                            icon={item.icon}
                                            isActive={pathname === item.href}
                                            onClick={() => {
                                                if (isMobile) {
                                                    setIsMobileOpen(false);
                                                }
                                            }}
                                        >
                                            {item.label}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ),
                            )}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center justify-between">
                                <ThemeToggle />
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full justify-start bg-red-500/80 hover:bg-red-500 text-white border-0"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>
                                    Keluar
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="w-full justify-start border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
                            >
                                <Link href="/">Halaman Utama</Link>
                            </Button>
                        </div>
                    </SidebarFooter>
                    </Sidebar>
                </div>
                <div
                    className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${
                        isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
                    } print:ml-0`}
                >
                    <AdminHeader
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        isMobileOpen={isMobileOpen}
                        setIsMobileOpen={setIsMobileOpen}
                        menuItems={menuItems}
                        pathname={pathname}
                    />
                    <main className="flex-1 p-4 md:p-8">
                        <div className="max-w-screen-xl mx-auto">
                            <AdaptiveBreadcrumb
                                labels={ADMIN_BREADCRUMB_LABELS}
                                hideOnHome={false}
                                className="mb-4 sm:mb-6"
                            />
                            <div className="mb-4 hidden items-center gap-4 md:flex">
                                {pathname !== '/admin/dashboard' && (
                                    <h1 className="text-2xl font-bold">
                                        {/* {menuItems
                                            .flatMap((i) =>
                                                i.subItems
                                                    ? i.subItems.map((s) => ({
                                                          ...s,
                                                          icon: i.icon,
                                                      }))
                                                    : i,
                                            )
                                            .find((i) => i.href === pathname)
                                            ?.label || 'Dashboard'} */}
                                    </h1>
                                )}
                            </div>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
