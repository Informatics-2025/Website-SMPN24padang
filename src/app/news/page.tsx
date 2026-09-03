import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Berita & Pengumuman Terbaru SMPN 24 Padang | Informasi Sekolah Terkini",
  description:
    "Berita dan pengumuman terbaru dari SMPN 24 Padang. Dapatkan informasi terkini seputar kegiatan, prestasi, dan acara sekolah.",
};

export const revalidate = 120;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicNews } from "@/features/news/actions";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function NewsPage() {
  const newsItems = await getPublicNews();

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-24">
      <div className="text-center">
        <h1 className="font-headline text-2xl sm:text-4xl font-bold text-primary md:text-5xl">
          Berita & Pengumuman
        </h1>
        <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground">
          Ikuti terus berita, acara, dan pengumuman terbaru dari SMPN 24 Padang.
        </p>
      </div>

      <section className="mt-8 md:mt-12">
        <h2 className="font-headline text-2xl font-bold text-primary sm:text-3xl mb-4 sm:mb-8">
          Berita Lainnya
        </h2>
        {newsItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {newsItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col"
              >
                <CardHeader className="p-0">
                  <Link href={`/news/${item.id}`} className="block relative aspect-[16/10] sm:aspect-video w-full overflow-hidden">
                    <Image
                      src={item.imageUrl || "https://placehold.co/600x400.png"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </Link>
                </CardHeader>
                <CardContent className="flex flex-grow flex-col p-3 sm:p-5 md:p-6">
                  <p className="mb-1 text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <CardTitle className="font-headline text-xs sm:text-base md:text-lg lg:text-xl font-bold text-primary leading-snug">
                    <Link href={`/news/${item.id}`} className="line-clamp-2 hover:underline">
                      {item.title}
                    </Link>
                  </CardTitle>
                  <p className="mt-1 sm:mt-2 flex-grow text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
                    {item.description}
                  </p>
                  <Button
                    variant="link"
                    asChild
                    className="mt-2 sm:mt-4 p-0 h-auto self-start text-xs sm:text-sm text-accent hover:text-accent/80 font-medium"
                  >
                    <Link href={`/news/${item.id}`}>
                      Baca Lebih Lanjut <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-8">
            Belum ada berita yang dipublikasikan.
          </p>
        )}
      </section>
    </div>
  );
}
