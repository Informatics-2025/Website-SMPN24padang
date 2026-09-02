import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryItems } from "./actions";

export const metadata: Metadata = {
  title: "Galeri Foto & Video SMPN 24 Padang | Kegiatan dan Momen Sekolah",
  description:
    "Galeri foto dan video SMPN 24 Padang. Jelajahi momen kegiatan belajar, acara sekolah, dan suasana lingkungan sekolah kami.",
};

export const revalidate = 300;

export default async function GalleryPage() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
          Galeri Sekolah
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Momen-momen berharga dari kegiatan belajar, berkarya, dan berprestasi
          di sekolah kami.
        </p>
      </div>

      {galleryItems.length > 0 ? (
        <div className="mt-12 columns-2 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className="relative mb-4 break-inside-avoid"
              data-aos="fade-up"
              data-aos-delay={(index % 4) * 100}
            >
              <Card className="overflow-hidden">
                <Image
                  width={600}
                  height={400}
                  src={item.src}
                  alt={item.alt}
                  className={cn(
                    "w-full object-cover",
                    item.orientation === "landscape"
                      ? "aspect-video"
                      : "aspect-[3/4]",
                  )}
                />
              </Card>
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-sm font-bold text-white">{item.category}</p>
                <p className="text-xs text-white/90">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-muted-foreground">
          <Image
            width={800}
            height={600}
            src="https://via.placeholder.com/800x600.png/000000/FFFFFF?text=Image+Not+Found"
            alt="Placeholder"
            className="mx-auto w-full max-w-lg rounded-lg"
          />
          <p className="mt-4">
            Belum ada gambar di galeri. Silakan periksa kembali nanti.
          </p>
        </div>
      )}
    </div>
  );
}
