import { Card } from "@/components/ui/card";
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

import { getPastPrincipals } from "@/app/actions"; // Corrected import path

export const metadata: Metadata = {
  title: "Riwayat Kepala Sekolah | SMPN 24 Padang",
  description:
    "Daftar lengkap riwayat kepala sekolah yang pernah memimpin SMPN 24 Padang, beserta periode jabatannya.",
};

export const revalidate = 600;

export default async function PastPrincipalsPage() {
  const pastPrincipals = await getPastPrincipals();

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
          Riwayat Kepala Sekolah
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Para pemimpin yang telah mendedikasikan diri untuk kemajuan sekolah.
        </p>
      </div>

      {pastPrincipals.length > 0 ? (
        <section className="mt-16">
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
                {pastPrincipals.map((principal) => (
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
        </section>
      ) : (
        <div className="pt-16 text-center text-muted-foreground">
          <p>Belum ada data riwayat kepala sekolah yang ditambahkan.</p>
        </div>
      )}
    </div>
  );
}
