import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Camera, Recycle, Trash2 } from "lucide-react";
import Tab1_SispendikDashboard from "./tab-1-sispendik-dashboard";
import Tab2_Articles from "./tab-2-articles";
import Tab3_Documentation from "./tab-3-documentation";

export default function SispendikPage() {
  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 max-w-7xl">
      <div className="space-y-1.5 text-center print:hidden">
        <div className="flex items-center justify-center gap-2">
          <Recycle className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Sispendig SMPN 24 Padang
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
          Sistem Pengelolaan Sampah Digital
          <br />
          Pantau setoran sampah, edukasi lingkungan, dan dokumentasi kegiatan.
        </p>
      </div>

      <Tabs defaultValue="news" className="mt-4 w-full">
        <TabsList className="mx-auto grid h-auto w-full max-w-2xl grid-cols-3 gap-1 rounded-full bg-muted/70 p-1 print:hidden sm:gap-2">
          <TabsTrigger
            value="news"
            className="min-h-11 gap-1.5 rounded-full px-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:gap-2 sm:px-4 sm:text-sm"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>Edukasi</span>
          </TabsTrigger>
          <TabsTrigger
            value="documentation"
            className="min-h-11 gap-1.5 rounded-full px-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:gap-2 sm:px-4 sm:text-sm"
          >
            <Camera className="h-4 w-4 shrink-0" />
            <span>Dokumentasi</span>
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            className="min-h-11 gap-1.5 rounded-full px-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:gap-2 sm:px-4 sm:text-sm"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span>Setoran Sampah</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="news">
          <Tab2_Articles />
        </TabsContent>
        <TabsContent value="documentation">
          <Tab3_Documentation />
        </TabsContent>
        <TabsContent value="dashboard">
          <Tab1_SispendikDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
