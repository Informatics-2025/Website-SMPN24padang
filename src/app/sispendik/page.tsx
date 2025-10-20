import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recycle } from 'lucide-react';
import Tab1_SispendikDashboard from './Tab1_SispendikDashboard';
import Tab2_Articles from './Tab2_Articles';
import Tab3_Documentation from './Tab3_Documentation';

export default function SispendikPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Recycle className="h-8 w-8 text-green-600" />
                    <h2 className="text-3xl font-bold tracking-tight">
                        Sispendig SMPN 24 Padang
                    </h2>
                </div>
                <p className="text-muted-foreground">
                    Pantau data sampah, lihat edukasi seputar sampah, dan
                    jelajahi dokumentasi kegiatan.
                </p>
            </div>

            <Tabs defaultValue="news" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted p-0 border-b">
                    <TabsTrigger
                        value="news"
                        className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
                    >
                        Edukasi
                    </TabsTrigger>
                    <TabsTrigger
                        value="documentation"
                        className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
                    >
                        Dokumentasi
                    </TabsTrigger>
                    <TabsTrigger
                        value="dashboard"
                        className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
                    >
                        Rekapitulasi Setoran
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
