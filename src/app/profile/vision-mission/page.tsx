import { getProfile } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Target } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visi & Misi SMPN 24 Padang | Fondasi Pendidikan Unggul",
  description:
    "Pahami visi dan misi SMPN 24 Padang yang menjadi landasan utama dalam membentuk karakter dan mencetak generasi berprestasi. Komitmen kami untuk pendidikan berkualitas.",
};

export const revalidate = 300;

export default async function VisionMissionPage() {
  const data = await getProfile();
  const vision = data?.vision || "Visi belum tersedia.";
  const mission = data?.mission || "Misi belum tersedia.";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-24">
      <div className="text-center">
        <h1 className="font-headline text-5xl font-bold text-primary md:text-6xl">
          Visi & Misi
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Prinsip-prinsip penuntun yang membentuk setiap aspek kehidupan di SMPN
          24 Padang.
        </p>
      </div>

      <section className="mt-16 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="h-6 w-6 text-accent" />{" "}
              <span className="text-2xl">Visi Kami</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4 text-center text-2xl font-bold text-foreground/80">
            {vision}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Book className="h-6 w-6 text-accent" />{" "}
              <span className="text-2xl">Misi Kami</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-line py-4 text-base font-bold text-foreground/80">
            {mission}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
