import {
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
  "h-auto flex-1 basis-[8.5rem] whitespace-normal rounded-full px-3 py-2 text-xs font-bold leading-tight sm:text-sm " +
  "transition-colors data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm " +
  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground";

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
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Kelola Edukasi Sispendig</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus berita seputar bank sampah.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <WasteNewsTab />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="videos">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Kelola Video Edukasi</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus video edukasi seputar bank sampah.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <WasteVideosTab />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="documentation">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Kelola Dokumentasi Bank Sampah</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus dokumentasi kegiatan bank sampah.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <WasteDocumentationTab />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
