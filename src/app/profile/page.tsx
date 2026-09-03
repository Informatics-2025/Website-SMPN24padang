import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";
import Image from "next/image";

import { getPastPrincipals, getProfile } from "../actions";

export const metadata: Metadata = {
  title:
    "Profil Lengkap SMPN 24 Padang | Sejarah, Visi, Misi, dan Kepala Sekolah",
  description:
    "Profil lengkap SMPN 24 Padang. Temukan informasi tentang sejarah, visi, misi, sambutan kepala sekolah, dan daftar kepala sekolah terdahulu.",
};

export const revalidate = 300;

export default async function ProfilePage() {
  const profile = await getProfile();
  const pastPrincipals = await getPastPrincipals();

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
          Profil Sekolah
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Mengenal lebih dekat SMPN 24 Padang.
        </p>
      </div>

      <section className="mt-10 md:mt-16">
        <Card className="overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="mb-6 text-center font-headline text-2xl font-bold text-primary md:mb-8 md:text-3xl">
              Sambutan dari Kepala Sekolah
            </h2>

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="mx-auto w-44 shrink-0 overflow-hidden rounded-lg bg-muted shadow-md sm:w-52 md:mx-0 md:w-[300px] lg:w-[350px]">
                <Image
                  src={
                    profile?.principalImageUrl ||
                    "https://placehold.co/350x466.png"
                  }
                  alt="Kepala Sekolah SMPN 24 Padang"
                  width={350}
                  height={466}
                  className="aspect-[3/4] h-auto w-full object-cover object-top transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="space-y-4 text-left text-[15px] leading-7 text-foreground/80 md:text-base md:leading-relaxed [&_h1]:font-headline [&_h1]:text-xl [&_h1]:font-bold [&_h1]:leading-snug [&_h1]:text-foreground [&_h2]:font-headline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-foreground [&_h3]:font-headline [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-foreground [&_h4]:font-headline [&_h4]:text-lg [&_h4]:font-bold [&_h4]:leading-snug [&_h4]:text-foreground [&_strong]:font-bold [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      profile?.principalWelcome?.replace(/\n/g, "<br />") ||
                      "",
                  }}
                ></div>
                <div className="mt-6 flex justify-start md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="font-semibold text-primary">
                      {profile?.principalName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Kepala Sekolah SMPN 24 Padang
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-16">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">
            Tentang Sekolah
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Perjalanan SMPN 24 Padang dari masa ke masa.
          </p>
        </div>
        <div className="mt-12">
          <Card>
            <CardContent className="p-5 text-foreground/80 md:p-8">
              <div
                className="space-y-4 text-left text-[15px] leading-7 md:text-base md:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: profile?.history?.replace(/\n/g, "<br />") || "",
                }}
              ></div>
            </CardContent>
          </Card>
        </div>
      </section>

      {pastPrincipals.length > 0 && (
        <section className="mt-16">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">
              Riwayat Kepala Sekolah
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Para pemimpin yang telah mendedikasikan diri untuk kemajuan
              sekolah.
            </p>
          </div>
          <div className="mt-12">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Periode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...pastPrincipals].reverse().map((principal) => (
                    <TableRow key={principal.id}>
                      <TableCell>
                        <Image
                          src={
                            principal.imageUrl ||
                            "https://placehold.co/120x120.png"
                          }
                          alt={principal.name}
                          width={120}
                          height={120}
                          className="rounded-md object-cover bg-muted"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {principal.name}
                      </TableCell>
                      <TableCell>{principal.period}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
