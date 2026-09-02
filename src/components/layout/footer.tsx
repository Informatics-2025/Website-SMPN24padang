'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

type ContactInfo = {
    address: string;
    phone: string;
    email: string;
    googleMapsUrl: string | null;
};

type FooterProps = {
    showMap?: boolean;
    contactInfo: ContactInfo | null;
};

export default function Footer({ showMap = true, contactInfo }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#286e3b] text-white border-t border-[#34884c]">
            <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-10 md:grid-cols-4">
                {/* Brand & Tagline */}
                <div className="space-y-3.5 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 p-1 border border-white/25">
                            <Image
                                src="/logo.png"
                                alt="SMP Negeri 24 Padang Logo"
                                width={40}
                                height={40}
                                className="h-8 w-auto object-contain"
                            />
                        </div>
                        <span className="font-headline text-lg sm:text-xl font-bold text-white tracking-tight">
                            SMP Negeri 24 Padang
                        </span>
                    </Link>
                    <p className="text-emerald-100/90 text-sm leading-relaxed">
                        Membina Pikiran, Membentuk Masa Depan. Jelajahi dunia
                        pembelajaran dan penemuan kami.
                    </p>
                </div>

                {/* Hubungi Kami */}
                <div className="space-y-3.5 md:col-span-1">
                    <h3 className="font-headline text-base sm:text-lg font-bold text-white">
                        Hubungi Kami
                    </h3>
                    <ul className="space-y-2.5 text-emerald-100/95 text-sm">
                        <li className="flex items-start gap-2.5">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                            <span className="flex-grow leading-snug">
                                {contactInfo?.address}
                            </span>
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Phone className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                            <span>{contactInfo?.phone}</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Mail className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                            <span>{contactInfo?.email}</span>
                        </li>
                    </ul>
                    <div className="flex items-center gap-2.5 pt-1">
                        <Link
                            href="https://www.instagram.com/smp24padang?igsh=MWx5NWM1bXZtd2E1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 border border-white/20 text-white transition-all hover:bg-white/30 hover:text-emerald-100"
                            aria-label="Instagram"
                        >
                            <Instagram className="h-4 w-4" />
                        </Link>
                        <Link
                            href="https://youtube.com/@ssk_spendupat?si=O8iKzbAxsGsuedXm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 border border-white/20 text-white transition-all hover:bg-white/30 hover:text-emerald-100"
                            aria-label="YouTube"
                        >
                            <Youtube className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Google Maps & Developer Credits */}
                {showMap && contactInfo?.googleMapsUrl && (
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <div className="overflow-hidden rounded-xl border border-white/25">
                            <iframe
                                src={contactInfo.googleMapsUrl}
                                width="100%"
                                height="260"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Peta Lokasi Sekolah"
                            ></iframe>
                        </div>
                        <div className="flex items-center pt-0.5">
                            <Link
                                href="https://github.com/Informatics-2025/Website-SMPN24padang/blob/main/README.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-emerald-200/80 hover:text-white transition-colors duration-200"
                            >
                                <svg
                                    className="w-3.5 h-3.5 fill-current opacity-90 shrink-0"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12 2C6.48 2 2 6.58 2 12.14c0 4.46 2.87 8.24 6.84 9.58.5.1.68-.22.68-.48v-1.68c-2.78.61-3.37-1.37-3.37-1.37-.45-1.17-1.1-1.48-1.1-1.48-.9-.63.07-.62.07-.62 1 .07 1.52 1.04 1.52 1.04.88 1.54 2.32 1.1 2.89.84.09-.66.35-1.1.63-1.35-2.22-.26-4.56-1.13-4.56-5 0-1.1.39-1.99 1.03-2.7-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.03A9.3 9.3 0 0112 6.8c.85 0 1.71.12 2.51.35 1.91-1.3 2.75-1.03 2.75-1.03.55 1.4.2 2.44.1 2.7.64.71 1.03 1.6 1.03 2.7 0 3.88-2.35 4.73-4.58 4.98.36.32.68.95.68 1.92v2.84c0 .26.18.58.68.48A10.14 10.14 0 0022 12.14C22 6.58 17.52 2 12 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="underline underline-offset-2 decoration-dotted hover:decoration-solid">
                                    Dikembangkan oleh Mahasiswa Magang Teknik Informatika UPI &quot;YPTK&quot; Padang
                                    (Aira, Aldi, Ikhwan, Habib, Rafi)
                                </span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Copyright Bar - Sedikit lebih gelap dari footer */}
            <div className="bg-[#1c532a] border-t border-[#286e3b]/60 py-3.5">
                <div className="container mx-auto flex items-center justify-center px-4 text-center text-xs text-emerald-100/90">
                    <Link href="/login" className="hover:text-white transition-colors">
                        <p>
                            Copyright © {currentYear} SMP Negeri 24 Padang. All
                            Rights Reserved.
                        </p>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
