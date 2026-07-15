'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabSetoranGuru } from './components/setoran-guru-tab';
import { TabSetoranKelas } from './components/setoran-kelas-tab';
import type { SispendikClientProps } from './components/types';
import { TabSetoranMasyarakat } from './components/setoran-masyarakat-tab';
import { TabLaporanSispendik } from './components/laporan-sispendik-tab';

// --- MAIN WRAPPER COMPONENT ---
export default function SispendikClient(props: SispendikClientProps) {
    const [tabValue, setTabValue] = useState<'kelas' | 'guru' | 'masyarakat' | 'laporan'>('kelas');
    const handleTabChange = (value: string) => {
        setTabValue(value as 'kelas' | 'guru' | 'masyarakat' | 'laporan');
    };

    return (
        <Tabs value={tabValue} onValueChange={handleTabChange} className="w-full">
            <div className="mb-4 block sm:hidden print:hidden">
                <label htmlFor="sispendik-tab-select" className="sr-only">
                    Pilih tab
                </label>
                <select
                    id="sispendik-tab-select"
                    className="w-full rounded-md border border-muted bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={tabValue}
                    onChange={(event) => setTabValue(event.target.value as any)}
                >
                    <option value="kelas">Setoran per Kelas</option>
                    <option value="guru">Setoran Guru</option>
                    <option value="masyarakat">Setoran Masyarakat</option>
                    <option value="laporan">Laporan</option>
                </select>
            </div>
            <div className="hidden sm:block overflow-x-auto print:hidden">
                <TabsList className="grid w-full grid-cols-4 gap-2">
                    <TabsTrigger
                        value="kelas"
                        className="min-w-[140px] truncate data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        Setoran per Kelas
                    </TabsTrigger>
                    <TabsTrigger
                        value="guru"
                        className="min-w-[140px] truncate data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        Setoran Guru
                    </TabsTrigger>
                    <TabsTrigger
                        value="masyarakat"
                        className="min-w-[140px] truncate data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        Setoran Masyarakat
                    </TabsTrigger>
                    <TabsTrigger
                        value="laporan"
                        className="min-w-[140px] truncate data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        Laporan
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="kelas">
                <TabSetoranKelas
                    kelas={props.kelas}
                    jenisSampah={props.jenisSampah}
                />
            </TabsContent>
            <TabsContent value="guru">
                <TabSetoranGuru
                    jenisSampah={props.jenisSampah}
                    gurus={props.gurus}
                    initialSetoranGuru={props.initialSetoranGuru}
                />
            </TabsContent>
            <TabsContent value="masyarakat">
                <TabSetoranMasyarakat jenisSampah={props.jenisSampah} />
            </TabsContent>
            <TabsContent value="laporan">
                <TabLaporanSispendik />
            </TabsContent>
        </Tabs>
    );
}
