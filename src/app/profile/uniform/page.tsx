import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Image from "next/image";
import { getUniforms } from "./actions";

export const metadata: Metadata = {
  title: "Seragam Sekolah SMPN 24 Padang | Panduan Lengkap & Aturan",
  description:
    "Temukan panduan lengkap seragam resmi SMPN 24 Padang untuk siswa-siswi. Informasi detail mengenai jenis seragam, jadwal penggunaan, dan aturan yang berlaku di sekolah kami.",
};

export const revalidate = 600;

export default async function UniformPage() {
  const uniforms = await getUniforms();

  const dayOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const sortedUniforms = uniforms.sort((a, b) => {
    if (a.type === "sport") return 1;
    if (b.type === "sport") return -1;
    return dayOrder.indexOf(a.day!) - dayOrder.indexOf(b.day!);
  });

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
          Seragam Sekolah
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Panduan seragam resmi untuk siswa-siswi SMPN 24 Padang.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 md:gap-8">
        {sortedUniforms.map((uniform) => (
          <Card key={uniform.id} className="overflow-hidden text-center">
            <CardHeader className="p-0">
              <div className="relative aspect-[4/6] w-full">
                <Image
                  src={uniform.image || "https://placehold.co/400x600.png"}
                  alt={uniform.day || "Olahraga"}
                  fill
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <CardTitle className="font-headline text-lg md:text-xl text-primary">
                {uniform.day || "Olahraga"}
              </CardTitle>
              {uniform.description && (
                <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                  {uniform.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
