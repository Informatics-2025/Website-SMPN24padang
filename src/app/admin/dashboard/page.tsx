import { db } from '@/lib/db';
import {
    announcements,
    news,
    galleryItems,
    statistics,
    staff,
    videos,
    achievements,
} from '@/lib/db/schema';
import { count } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Newspaper,
    Trophy,
    Image as ImageIcon,
    Users,
    Home,
    Phone,
    UserCircle,
    Target,
    Network,
    Award,
    Shirt,
    Megaphone,
    UserCheck,
    UserCog,
    Video,
    MessageCircleQuestion,
    LayoutDashboard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const menuItems = [
    {
        href: '/admin/homepage',
        label: 'Halaman Beranda',
        icon: Home,
        description: 'Atur konten yang tampil di halaman depan website Anda.',
    },
    {
        href: '/admin/profile/principal',
        label: 'Profil Sekolah',
        icon: UserCircle,
        description: 'Perbarui informasi sambutan kepala sekolah dan sejarah.',
    },
    {
        href: '/admin/profile/vision-mission',
        label: 'Visi & Misi',
        icon: Target,
        description: 'Ubah pernyataan visi dan poin-poin misi sekolah.',
    },
    {
        href: '/admin/organization',
        label: 'Struktur Organisasi',
        icon: Network,
        description: 'Kelola bagan dan daftar struktur organisasi sekolah.',
    },
    {
        href: '/admin/curriculum',
        label: 'Kurikulum',
        icon: Target,
        description: 'Kelola informasi dan struktur kurikulum sekolah.',
    },
    {
        href: '/admin/accreditation',
        label: 'Sertifikasi & Penghargaan',
        icon: Award,
        description: 'Tampilkan semua sertifikasi dan penghargaan.',
    },
    {
        href: '/admin/profile/uniform',
        label: 'Seragam',
        icon: Shirt,
        description: 'Informasikan jenis-jenis seragam yang digunakan.',
    },
    {
        href: '/admin/staff',
        label: 'Guru & Staf',
        icon: Users,
        description: 'Tambah, ubah, atau hapus data pengajar dan staf.',
    },
    {
        href: '/admin/news',
        label: 'Berita',
        icon: Newspaper,
        description: 'Publikasikan artikel berita terbaru untuk pengunjung.',
    },
    {
        href: '/admin/announcements',
        label: 'Pengumuman',
        icon: Megaphone,
        description: 'Buat pengumuman penting untuk seluruh warga sekolah.',
    },
    {
        href: '/admin/sispendik',
        label: 'Sispendig',
        icon: LayoutDashboard,
        description:
            'Kelola data dan laporan dari sistem bank sampah Sispendik.',
    },
    {
        href: '/admin/achievements',
        label: 'Prestasi',
        icon: Trophy,
        description: 'Catat dan pamerkan prestasi yang telah diraih.',
    },
    {
        href: '/admin/gallery',
        label: 'Galeri',
        icon: ImageIcon,
        description: 'Unggah dan kelola foto-foto kegiatan sekolah.',
    },
    {
        href: '/admin/videos',
        label: 'Video',
        icon: Video,
        description: 'Unggah dan kelola video kegiatan sekolah.',
    },
    {
        href: '/admin/contact',
        label: 'Kontak',
        icon: Phone,
        description: 'Perbarui alamat, email, dan nomor telepon sekolah.',
    },
    {
        href: '/admin/faq',
        label: 'FAQ',
        icon: MessageCircleQuestion,
        description: 'Tambah dan kelola pertanyaan yang sering diajukan.',
    },
];

async function getDashboardStats() {
    const statsData = await db.select().from(statistics).limit(1);
    const newsCount = await db.select({ value: count() }).from(news);
    const announcementsCount = await db
        .select({ value: count() })
        .from(announcements);
    const galleryCount = await db.select({ value: count() }).from(galleryItems);
    const achievementsCount = await db
        .select({ value: count() })
        .from(achievements);
    const videosCount = await db.select({ value: count() }).from(videos);

    const stats = statsData[0];

    return {
        students: stats?.students ?? 0,
        teachers: stats?.teachers ?? 0,
        staff: stats?.staff ?? 0,
        news: newsCount[0].value,
        announcements: announcementsCount[0].value,
        gallery: galleryCount[0].value,
        achievements: achievementsCount[0].value,
        videos: videosCount[0].value,
    };
}

function StatCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    icon: LucideIcon;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    const statItems = [
        { title: 'Siswa', value: stats.students, icon: Users },
        { title: 'Guru', value: stats.teachers, icon: UserCheck },
        { title: 'Staf', value: stats.staff, icon: UserCog },
        { title: 'Berita', value: stats.news, icon: Newspaper },
        { title: 'Pengumuman', value: stats.announcements, icon: Megaphone },
        { title: 'Galeri', value: stats.gallery, icon: ImageIcon },
        { title: 'Prestasi', value: stats.achievements, icon: Trophy },
        { title: 'Video', value: stats.videos, icon: Video },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-headline text-3xl font-bold text-primary md:text-4xl">
                    Dashboard
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Ringkasan konten dan data website Anda.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statItems.map((item) => (
                    <StatCard key={item.title} {...item} />
                ))}
            </div>

            <div className="flex flex-col gap-2 mt-8">
                <h2 className="font-headline text-2xl font-bold text-primary md:text-3xl">
                    Kelola Konten
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    Pilih salah satu menu di bawah ini untuk mengubah konten
                    website.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link href={item.href} key={item.href}>
                            <Card className="flex h-full transform flex-col transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-semibold">
                                        {item.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-base text-muted-foreground">
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
