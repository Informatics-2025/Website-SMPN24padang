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

      <section className="mt-16">
        <Card>
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="font-headline text-3xl font-bold text-primary mb-4 text-center">
              Sambutan dari Kepala Sekolah
            </h2>
            <div className="float-left mr-6 w-full md:w-auto max-w-[350px]">
              <Image
                src={
                  profile?.principalImageUrl ||
                  "https://placehold.co/350x466.png"
                }
                alt="Principal"
                width={350}
                height={466}
                className="transition-transform duration-300 hover:scale-105 shadow-md"
              />
            </div>
            <div
              className="space-y-4 text-foreground/80 text-justify leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  profile?.principalWelcome?.replace(/\n/g, "<br />") || "",
              }}
            ></div>
            <div className="flex justify-end mt-6">
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {profile?.principalName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Kepala Sekolah SMPN 24 Padang
                </p>
              </div>
            </div>
            <div className="clear-both"></div>
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
            <CardContent className="p-8 text-foreground/80">
              <div
                className="space-y-4 text-justify leading-relaxed"
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
