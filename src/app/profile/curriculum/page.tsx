import { PDFViewer } from "@/components/pdf-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurriculum } from "@/lib/db/queries/curriculum";
import type { Curriculum } from "@/types/curriculum";

export const revalidate = 600;

export default async function CurriculumPage() {
  const { data: documents, error } = await getCurriculum();

  if (error || !documents) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Dokumen Kurikulum</h1>
        <p className="text-red-500">
          Gagal memuat dokumen. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }

  const kurikulumDocs = documents.filter((doc) => doc.category === "kurikulum");
  const kesiswaanDocs = documents.filter((doc) => doc.category === "kesiswaan");
  const saranaPrasaranaDocs = documents.filter(
    (doc) => doc.category === "sarana-prasarana",
  );

  const renderContent = (docs: Curriculum[], type: string) => {
    if (docs.length === 0) {
      return (
        <p className="text-muted-foreground">
          Tidak ada dokumen {type} saat ini.
        </p>
      );
    }
    return (
      <div className="grid gap-8">
        {docs.map((doc) => (
          <PDFViewer
            key={doc.id}
            title={doc.title}
            description={doc.description}
            url={doc.pdfUrl}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dokumen Sekolah</h1>

      <Tabs defaultValue="kurikulum" className="space-y-6">
        <div className="w-full overflow-x-auto flex justify-center">
          <TabsList className="bg-muted p-0 border-b grid w-full grid-cols-3">
            <TabsTrigger
              value="kurikulum"
              className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
            >
              Kurikulum
            </TabsTrigger>
            <TabsTrigger
              value="kesiswaan"
              className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
            >
              Kesiswaan
            </TabsTrigger>
            <TabsTrigger
              value="sarana-prasarana"
              className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
            >
              Sarana & Prasarana
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kurikulum">
          {renderContent(kurikulumDocs, "kurikulum")}
        </TabsContent>

        <TabsContent value="kesiswaan">
          {renderContent(kesiswaanDocs, "kesiswaan")}
        </TabsContent>

        <TabsContent value="sarana-prasarana">
          {renderContent(saranaPrasaranaDocs, "sarana & prasarana")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
