'use client';

import AdminHeader from '@/components/admin-header'; // Import AdminHeader
import { ThemeToggle } from '@/components/theme-toggle';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

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
                    label: 'Sertifikasi & Penghargaan',
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
                {/* Overlay for mobile */}
                {isSidebarOpen && isMobile && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out opacity-100"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                <Sidebar
                    className={`h-screen fixed top-0 left-0 w-64 z-50 transition-transform duration-300 ease-in-out ${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 print:hidden`} // Always open on desktop
                >
                    <SidebarHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center mr-16">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={32}
                                    height={32}
                                />
                                <span className="text-lg font-semibold text-primary ml-2 group-data-[state=collapsed]:hidden">
                                    Admin
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/admin/profile"
                                    className="group-data-[state=collapsed]:hidden"
                                >
                                    <UserCircle className="h-6 w-6 text-muted-foreground hover:text-primary" />
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
                                                                                        setIsSidebarOpen(
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
                                                    setIsSidebarOpen(false);
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
                            <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center">
                                <ThemeToggle />
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full justify-start group-data-[state=collapsed]:justify-center"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span className="group-data-[state=collapsed]:hidden">
                                    Keluar
                                </span>
                            </Button>
                            <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center">
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full justify-start group-data-[state=collapsed]:justify-center"
                                >
                                    <Link href="/">Halaman Utama</Link>
                                </Button>
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>
                <div
                    className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
                        isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
                    } print:ml-0`}
                >
                    <AdminHeader
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        menuItems={menuItems}
                        pathname={pathname}
                    />
                    <main className="flex-1 p-4 md:p-8">
                        <div className="max-w-screen-xl mx-auto">
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
