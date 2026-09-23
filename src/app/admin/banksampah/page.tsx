﻿import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WasteDocumentationTab from "./components/waste-documentation-tab";
import WasteNewsTab from "./components/waste-news-tab";
import WasteVideosTab from "./components/waste-videos-tab";

const TAB_TRIGGER_CLASS =
  "h-auto flex-1 basis-[8.5rem] whitespace-normal rounded-full px-3 py-2 text-xs font-bold leading-tight sm:text-sm";

export default function BankSampahAdminPage() {
  return (
    <Tabs defaultValue="news" className="w-full">
      {/* Tab nav gaya kapsul: membungkus (wrap) di mobile, tidak terpotong
                dan tidak perlu digeser kiri-kanan. */}
      <TabsList className="flex h-auto w-full flex-wrap gap-1.5 rounded-2xl border bg-muted/60 p-1.5">
        <TabsTrigger value="news" className={TAB_TRIGGER_CLASS}>
          Edukasi Sispendig
        </TabsTrigger>
        <TabsTrigger value="videos" className={TAB_TRIGGER_CLASS}>
          Video Edukasi
        </TabsTrigger>
        <TabsTrigger value="documentation" className={TAB_TRIGGER_CLASS}>
          Dokumentasi Sispendig
        </TabsTrigger>
      </TabsList>
      <TabsContent value="news">
        <Card>
          <CardHeader>
            <CardTitle>Kelola Edukasi Sispendig</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus berita seputar bank sampah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WasteNewsTab />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="videos">
        <Card>
          <CardHeader>
            <CardTitle>Kelola Video Edukasi</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus video edukasi seputar bank sampah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WasteVideosTab />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="documentation">
        <Card>
          <CardHeader>
            <CardTitle>Kelola Dokumentasi Bank Sampah</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus dokumentasi kegiatan bank sampah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WasteDocumentationTab />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
