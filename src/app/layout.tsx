import type { Metadata, Viewport } from 'next';
import { Roboto, Montserrat } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import ConditionalLayout from '@/components/layout/conditional-layout';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import AOSInit from '@/components/aos-init';
import { SpeedInsights } from '@vercel/speed-insights/next';
import NextAuthSessionProvider from '@/components/session-provider';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { getContactInfo } from '@/lib/data/contact';

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-roboto',
    display: 'swap',
});

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['700', '800'],
    variable: '--font-montserrat',
    display: 'swap',
});

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://smpn24padang.sch.id';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#047857' },
        { media: '(prefers-color-scheme: dark)', color: '#0b0f17' },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'SMP Negeri 24 Padang | Website Resmi Sekolah',
        template: '%s | SMP Negeri 24 Padang',
    },
    description:
        'Website resmi SMP Negeri 24 Padang (Spendupat), Kota Padang, Sumatera Barat. Informasi lengkap profil sekolah, PPDB, prestasi siswa, berita terkini, program kurikulum, bank sampah sekolah (Sispendik), dan kegiatan kesiswaan.',
    keywords: [
        // Nama Sekolah & Brand
        'SMP Negeri 24 Padang',
        'SMPN 24 Padang',
        'SMP 24 Padang',
        'Spendupat',
        'Spendupat Padang',
        'Spendupat Juara',
        // Wilayah & Geografis (Padang, Sumatera Barat)
        'SMP di Kota Padang',
        'SMP Negeri Terbaik di Padang',
        'Sekolah Menengah Pertama Padang',
        'Dinas Pendidikan Kota Padang',
        'Pendidikan Padang Sumatera Barat',
        'Sekolah di Sumatera Barat',
        'SMP Lubuk Begalung Padang',
        // Akademik & Program
        'PPDB SMP 24 Padang',
        'Prestasi SMPN 24 Padang',
        'Ekstrakurikuler SMPN 24 Padang',
        'Akreditasi SMPN 24 Padang',
        'Sispendig SMP 24 Padang',
        'Bank Sampah Sekolah Padang',
        'Profil Guru SMP 24 Padang',
        'Kurikulum Merdeka SMP Padang',
    ],
    authors: [{ name: 'SMP Negeri 24 Padang', url: siteUrl }],
    creator: 'SMP Negeri 24 Padang',
    publisher: 'SMP Negeri 24 Padang',
    category: 'Education',
    applicationName: 'Website SMP Negeri 24 Padang',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: '/',
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
            { url: '/192.png', sizes: '192x192', type: 'image/png' },
            { url: '/512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: [`${siteUrl}/favicon.ico`],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180' },
            { url: '/167.png', sizes: '167x167' },
            { url: '/152.png', sizes: '152x152' },
        ],
    },
    manifest: `${siteUrl}/site.webmanifest`,
    openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: siteUrl,
        siteName: 'SMP Negeri 24 Padang',
        title: 'SMP Negeri 24 Padang | Membina Pikiran, Membentuk Masa Depan',
        description:
            'Website resmi SMP Negeri 24 Padang (Spendupat), Kota Padang, Sumatera Barat. Jelajahi profil, prestasi, berita, galeri, bank sampah sekolah (Sispendig), dan informasi lengkap seputar sekolah kami.',
        images: [
            {
                url: `${siteUrl}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: 'Logo dan Identitas Resmi SMP Negeri 24 Padang',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SMP Negeri 24 Padang | Website Resmi',
        description:
            'Website resmi SMP Negeri 24 Padang, Kota Padang, Sumatera Barat. Membina Pikiran, Membentuk Masa Depan.',
        images: [`${siteUrl}/opengraph-image`],
        creator: '@smp24padang',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: ['IC4fbcspLvv_VgDWKukeriJmjSSYmUO246NoRlUXDAw'],
    },
    other: {
        'geo.region': 'ID-SB',
        'geo.placename': 'Padang',
        'geo.position': '-0.9471;100.4172',
        'ICBM': '-0.9471, 100.4172',
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const contactInfo = await getContactInfo();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'SMP Negeri 24 Padang',
        alternateName: ['SMPN 24 Padang', 'SMP 24 Padang', 'Spendupat'],
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: `${siteUrl}/opengraph-image`,
        description:
            'Sekolah Menengah Pertama Negeri 24 Padang, institusi pendidikan unggul, cerdas, berkarakter, dan berprestasi di Kota Padang, Sumatera Barat.',
        telephone: contactInfo?.phone || '+62-751-XXXXXX',
        email: contactInfo?.email || 'info@smpn24padang.sch.id',
        address: {
            '@type': 'PostalAddress',
            streetAddress:
                contactInfo?.address ||
                'Jalan Raya Padang, Kota Padang',
            addressLocality: 'Padang',
            addressRegion: 'Sumatera Barat',
            postalCode: '25000',
            addressCountry: 'ID',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -0.9471,
            longitude: 100.4172,
        },
        sameAs: [
            'https://www.instagram.com/smp24padang',
            'https://youtube.com/@ssk_spendupat',
        ],
        areaServed: {
            '@type': 'City',
            name: 'Padang',
        },
    };

    return (
        <html lang="id" className="!scroll-smooth" suppressHydrationWarning>
            <head>
                <meta name="geo.region" content="ID-SB" />
                <meta name="geo.placename" content="Padang" />
                <meta name="geo.position" content="-0.9471;100.4172" />
                <meta name="ICBM" content="-0.9471, 100.4172" />
            </head>
            <body
                className={`${roboto.variable} ${montserrat.variable} font-body antialiased overflow-x-hidden`}
            >
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <NextAuthSessionProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        disableTransitionOnChange
                    >
                        <AOSInit />
                        <ConditionalLayout contactInfo={contactInfo}>
                            {children}
                        </ConditionalLayout>
                        <Toaster />
                        <BackToTopButton />
                        <SpeedInsights />
                    </ThemeProvider>
                </NextAuthSessionProvider>
            </body>
        </html>
    );
}
