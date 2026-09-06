'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { AdaptiveBreadcrumb } from '@/components/ui/adaptive-breadcrumb';

type ContactInfo = {
    address: string;
    phone: string;
    email: string;
    googleMapsUrl: string | null;
};

const PUBLIC_BREADCRUMB_LABELS: Record<string, string> = {
    news: 'Berita & Pengumuman',
    profile: 'Profil',
    principal: 'Profil Sekolah',
    'vision-mission': 'Visi & Misi',
    'organization-structure': 'Struktur Organisasi',
    curriculum: 'Kurikulum',
    accreditation: 'Akreditasi',
    faculty: 'Guru & Tenaga Kependidikan',
    'past-principals': 'Kepala Sekolah Terdahulu',
    uniform: 'Seragam Sekolah',
    achievements: 'Prestasi',
    gallery: 'Galeri',
    articles: 'Artikel',
    pengumuman: 'Pengumuman',
    sispendik: 'Sispendik',
    contact: 'Hubungi Kami',
    videos: 'Video',
};

export default function ConditionalLayout({
    children,
    contactInfo,
}: {
    children: React.ReactNode;
    contactInfo: ContactInfo | null;
}) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login';
    const isContactPage = pathname === '/contact';
    const isPublicSubPage = !isAdminPage && !isLoginPage && pathname !== '/';

    return (
        <div className="flex min-h-screen flex-col">
            {!isAdminPage && !isLoginPage && <Header contactInfo={contactInfo} />}
            {isPublicSubPage && (
                <div className="border-b border-border/40 bg-muted/25 py-2.5 sm:py-3 transition-colors">
                    <div className="container mx-auto px-4">
                        <AdaptiveBreadcrumb labels={PUBLIC_BREADCRUMB_LABELS} />
                    </div>
                </div>
            )}
            <main className="flex-grow">{children}</main>
            {!isAdminPage && !isLoginPage && <Footer showMap={!isContactPage} contactInfo={contactInfo} />}
            {!isAdminPage && !isLoginPage && <BackToTopButton />}
        </div>
    );
}
