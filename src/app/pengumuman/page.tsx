import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAnnouncements } from "@/features/announcements/actions";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pengumuman | SMPN 24 Padang",
  description: "Daftar pengumuman resmi dari SMPN 24 Padang.",
};

const extractGoogleDriveFileId = (url: string) => {
  const regex = /\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-6">Pengumuman</h1>
        <div className="grid gap-6">
          {announcements.length === 0 ? (
            <p className="text-muted-foreground">
              Belum ada pengumuman saat ini.
            </p>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription>
                    {new Date(announcement.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground whitespace-pre-wrap">
                    {announcement.description}
                  </p>
                  {announcement.pdfUrl && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Pratinjau Dokumen
                      </h3>
                      <div className="w-full aspect-video overflow-hidden rounded-lg border">
                        <iframe
                          src={`https://drive.google.com/file/d/${extractGoogleDriveFileId(
                            announcement.pdfUrl,
                          )}/preview`}
                          className="w-full h-full border-0"
                          allow="autoplay"
                          title={announcement.title}
                        ></iframe>
                      </div>
                      <Button asChild className="mt-4">
                        <Link
                          href={announcement.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat Dokumen Lengkap{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
