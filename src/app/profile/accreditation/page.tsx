import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { getAccreditations } from '@/lib/data/accreditation';

export const metadata: Metadata = {
    title: 'Akreditasi & Sertifikasi SMPN 24 Padang | Bukti Keunggulan Sekolah',
    description:
        'Lihat daftar akreditasi, sertifikasi, dan penghargaan resmi yang diterima SMPN 24 Padang. Bukti komitmen kami terhadap kualitas pendidikan dan keunggulan di Sumatera Barat.',
};

function getGoogleDriveEmbedLink(url: string): string {
    if (!url) return '';
    // Regular expression to find the file ID from a Google Drive link
    const fileIdRegex = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(fileIdRegex);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    // Return the original URL if it doesn't match the expected format
    return url;
}

export default async function AccreditationPage() {
    const accreditations = await getAccreditations();

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-24">
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
                    Sertifikasi Akreditasi
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Komitmen kami terhadap keunggulan yang diakui secara resmi.
                </p>
            </div>

            <section className="mt-16 space-y-12">
                {accreditations.map((doc, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader>
                            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-4">
                                    <FileText className="h-8 w-8 text-accent" />
                                    <div>
                                        <CardTitle className="font-headline text-xl text-primary">
                                            {doc.title}
                                        </CardTitle>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video w-full rounded-md border bg-muted mb-4">
                                <iframe
                                    src={getGoogleDriveEmbedLink(doc.link)}
                                    className="h-full w-full"
                                    style={{ border: 0 }}
                                    allow="fullscreen"
                                    title={`Pratinjau ${doc.title}`}
                                ></iframe>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {doc.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
                {accreditations.length === 0 && (
                    <div className="pt-16 text-center text-muted-foreground">
                        <p>
                            Belum ada data sertifikasi atau penghargaan yang
                            ditambahkan.
                        </p>
                    </div>
                )}
                <div className="pt-4 text-center text-sm text-muted-foreground">
                    <p>
                        Untuk pengalaman terbaik, gunakan tombol unduh untuk
                        melihat dokumen secara penuh.
                    </p>
                </div>
            </section>
        </div>
    );
}