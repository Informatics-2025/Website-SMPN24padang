import type { Metadata } from 'next';
import { getAchievements } from './actions';
import AchievementList from './_components/achievement-list';

export const metadata: Metadata = {
    title: 'Galeri Prestasi SMPN 24 Padang | Raihan Siswa dan Sekolah Terbaik di Indonesia',
    description:
        'Lihat berbagai prestasi membanggakan siswa-siswi dan SMPN 24 Padang dalam bidang akademik, non-akademik, dan kejuaraan. Inspirasi dari sekolah berprestasi di Indonesia.',
};

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
    const achievements = await getAchievements();

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12 md:py-24">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
                        Galeri Prestasi
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        Merayakan pencapaian luar biasa dari siswa-siswi dan
                        sekolah kami.
                    </p>
                </div>
                <AchievementList achievements={achievements} />
            </div>
        </div>
    );
}
