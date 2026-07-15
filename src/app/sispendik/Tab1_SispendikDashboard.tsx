'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    getClassTotals,
    getPerkembanganSampahKelas,
    getTotalsSummary,
    getTopWasteTypes,
    getGuruRanking,
    getMasyarakatTotals,
} from '@/app/admin/sispendik/actions';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from 'recharts';
import { Loader2, Printer } from 'lucide-react';

const MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];
const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#AF19FF',
    '#FF1919',
];

// --- TYPE DEFINITIONS ---
type TopWasteType = {
    wasteType: string;
    totalKg: number;
    totalValue: number;
    category?: string;
};
type ClassRanking = {
    className: string;
    total: number;
    totalValue: number;
    jenisList: string | null;
    categories: string | null;
};
type GuruRanking = {
    guruName: string;
    totalKg: number;
    wasteTypes: string | null;
    categories: string | null;
};

type MasyarakatTotal = {
    wasteType: string;
    category: string | null;
    totalKg: number;
};

// --- CUSTOM TOOLTIPS ---
const CustomClassTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border p-2 rounded-md shadow-md">
                <p className="font-bold">{label}</p>
                <p className="text-sm">
                    Total Sampah: {Number(payload[0].value).toFixed(2)} kg
                </p>
                <p className="text-sm text-muted-foreground">
                    Jenis: {payload[0].payload.jenisList || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                    Kategori: {payload[0].payload.categories || 'N/A'}
                </p>
            </div>
        );
    }
    return null;
};

const CustomGuruTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border p-2 rounded-md shadow-md">
                <p className="font-bold">{label}</p>
                <p className="text-sm">
                    Total Sampah: {Number(payload[0].value).toFixed(2)} kg
                </p>
                <p className="text-sm text-muted-foreground">
                    Jenis: {payload[0].payload.wasteTypes || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                    Kategori: {payload[0].payload.categories || 'N/A'}
                </p>
            </div>
        );
    }
    return null;
};

const renderCategoryTick = ({ x, y, payload, textAnchor }: any) => {
    const value = String(payload.value || '');
    const lineLength = 12;
    const lines = [] as string[];

    for (let i = 0; i < value.length; i += lineLength) {
        lines.push(value.slice(i, i + lineLength));
    }

    return (
        <g transform={`translate(${x},${y + 8})`}>
            {lines.map((line, index) => (
                <text
                    key={index}
                    x={0}
                    y={index * 14}
                    textAnchor={textAnchor || 'end'}
                    fill="currentColor"
                    fontSize={12}
                >
                    {line}
                </text>
            ))}
        </g>
    );
};

export default function SispendikDashboard() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [printSection, setPrintSection] = useState<'perkembangan' | 'guru' | 'masyarakat' | null>(null);

    const handlePrint = (section: 'perkembangan' | 'guru' | 'masyarakat') => {
        setPrintSection(section);
        setTimeout(() => {
            window.print();
        }, 150);
    };

    useEffect(() => {
        const handleAfterPrint = () => {
            setPrintSection(null);
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);
    const [classTotals, setClassTotals] = useState<ClassRanking[]>([]);
    const [classProgress, setClassProgress] = useState<{
        kelas: string;
        months: number[];
    }[]>([]);
    const [guruRanking, setGuruRanking] = useState<GuruRanking[]>([]);
    const [totalWaste, setTotalWaste] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [topClasses, setTopClasses] = useState<string[]>([]);
    const [topWasteTypes, setTopWasteTypes] = useState<TopWasteType[]>([]);
    const [masyarakatTotals, setMasyarakatTotals] = useState<MasyarakatTotal[]>([]);
    const [levelFilter, setLevelFilter] = useState<'all' | '7' | '8' | '9'>(
        'all',
    );
    const [topRankerType, setTopRankerType] = useState<'kelas' | 'guru'>(
        'kelas',
    );
    const [loading, setLoading] = useState(true);
    const [isMobileChart, setIsMobileChart] = useState(false);

    const maxClassTotal =
        classTotals.length > 0
            ? Math.max(...classTotals.map((c) => c.total))
            : 0;
    const maxGuruKg =
        guruRanking.length > 0
            ? Math.max(...guruRanking.map((g) => g.totalKg))
            : 0;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleResize = (event: MediaQueryListEvent) => {
            setIsMobileChart(event.matches);
        };

        setIsMobileChart(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [
                totalsData,
                progressData,
                summary,
                topWasteRes,
                guruRankData,
                masyarakatData,
            ] = await Promise.all([
                getClassTotals(month, year),
                getPerkembanganSampahKelas(year),
                getTotalsSummary(month, year),
                getTopWasteTypes(month, year),
                getGuruRanking(month, year),
                getMasyarakatTotals(month, year),
            ]);

            if (totalsData.data && Array.isArray(totalsData.data)) {
                const typedData = totalsData.data as ClassRanking[];
                const filteredData = typedData.filter(
                    (c) =>
                        levelFilter === 'all' ||
                        c.className.startsWith(levelFilter),
                );
                setClassTotals(filteredData);
                const sortedTopClasses = [...filteredData]
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 3)
                    .map((c) => c.className);
                setTopClasses(sortedTopClasses);
            } else {
                setClassTotals([]);
                setTopClasses([]);
            }

            if (progressData.data && Array.isArray(progressData.data)) {
                setClassProgress(progressData.data as {
                    kelas: string;
                    months: number[];
                }[]);
            } else {
                setClassProgress([]);
            }

            if (summary.data) {
                setTotalIncome(Number(summary.data.totalValue) || 0);
                setTotalWaste(Number(summary.data.totalKg) || 0);
            } else {
                setTotalIncome(0);
                setTotalWaste(0);
            }

            if (topWasteRes.data)
                setTopWasteTypes(topWasteRes.data as TopWasteType[]);
            else setTopWasteTypes([]);

            if (
                guruRankData.data &&
                Array.isArray(guruRankData.data) &&
                guruRankData.data.length > 0
            ) {
                setGuruRanking(guruRankData.data as GuruRanking[]);
            } else {
                setGuruRanking([]);
            }

            if (masyarakatData.data && Array.isArray(masyarakatData.data)) {
                setMasyarakatTotals(masyarakatData.data as MasyarakatTotal[]);
            } else {
                setMasyarakatTotals([]);
            }
            setLoading(false);
        };

        fetchData();
    }, [month, year, levelFilter]);

    return (
        <div className="space-y-8 pt-6 relative">
            {loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
                    <Loader2 className="w-10 h-10 animate-spin" />
                </div>
            )}

            {/* Integrated Header with Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">
                    Dashboard Rekapitulasi
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={String(month)}
                        onValueChange={(v) => setMonth(parseInt(v))}
                    >
                        <SelectTrigger className="w-auto h-9">
                            <SelectValue placeholder="Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m, idx) => (
                                <SelectItem
                                    key={m}
                                    value={(idx + 1).toString()}
                                >
                                    {m}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={String(year)}
                        onValueChange={(v) => setYear(parseInt(v))}
                    >
                        <SelectTrigger className="w-auto h-9">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem
                                    key={y}
                                    value={String(y)}
                                >
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={levelFilter}
                        onValueChange={(v) =>
                            setLevelFilter(v as any)
                        }
                    >
                        <SelectTrigger className="w-auto h-9">
                            <SelectValue placeholder="Tingkat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Semua Kelas
                            </SelectItem>
                            <SelectItem value="7">
                                Kelas 7
                            </SelectItem>
                            <SelectItem value="8">
                                Kelas 8
                            </SelectItem>
                            <SelectItem value="9">
                                Kelas 9
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card className="bg-green-100 dark:bg-green-900">
                    <CardHeader>
                        <CardTitle>Total Sampah</CardTitle>
                        <p className="text-2xl font-bold">
                            {Number(totalWaste || 0).toFixed(2)} kg
                        </p>
                    </CardHeader>
                </Card>
                <Card className="bg-green-100 dark:bg-green-900">
                    <CardHeader>
                        <CardTitle>Total Pendapatan</CardTitle>
                        <p className="text-2xl font-bold">
                            Rp {totalIncome.toLocaleString('id-ID')}
                        </p>
                    </CardHeader>
                </Card>
                <Card className="bg-green-100 dark:bg-green-900">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>
                                {topRankerType === 'kelas'
                                    ? 'Kelas Unggulan'
                                    : 'Guru Unggulan'}
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setTopRankerType(
                                        topRankerType === 'kelas'
                                            ? 'guru'
                                            : 'kelas',
                                    )
                                }
                            >
                                Lihat{' '}
                                {topRankerType === 'kelas'
                                    ? 'Guru'
                                    : 'Kelas'}
                            </Button>
                        </div>
                        <div className="space-y-2 pt-2 text-sm">
                            {topRankerType === 'kelas' ? (
                                topClasses.length > 0 ? (
                                    topClasses.map((c, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <span>•</span>
                                            <span>{c}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-2xl">-</p>
                                )
                            ) : guruRanking.length > 0 ? (
                                guruRanking.slice(0, 3).map((g, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-baseline"
                                    >
                                        <span>{g.guruName}</span>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {Number(g.totalKg || 0).toFixed(2)} kg
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-2xl">-</p>
                            )}
                        </div>
                    </CardHeader>
                </Card>
                <Card className="bg-green-100 dark:bg-green-900">
                    <CardHeader>
                        <CardTitle>Jenis Sampah Teratas</CardTitle>
                        <div className="space-y-2 pt-2 text-sm">
                            {topWasteTypes.length > 0 ? (
                                topWasteTypes.map((w, i) => (
                                    <div
                                        key={i}
                                        className="space-y-1"
                                    >
                                        <div className="flex justify-between items-baseline">
                                            <span>{w.wasteType}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {Number(w.totalKg || 0).toFixed(2)} kg
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Kategori: {w.category || '-'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center">-</p>
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {/* Class Totals Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Diagram Setoran Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={classTotals}
                                layout={isMobileChart ? 'vertical' : 'horizontal'}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: isMobileChart ? 20 : -10,
                                    bottom: isMobileChart ? 20 : 50,
                                }}
                                barCategoryGap="20%"
                                barSize={isMobileChart ? 18 : 24}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                {isMobileChart ? (
                                    <>
                                        <XAxis
                                            type="number"
                                            domain={[
                                                0,
                                                maxClassTotal > 0
                                                    ? Math.ceil(maxClassTotal * 1.1)
                                                    : 10,
                                            ]}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="className"
                                            width={130}
                                            tick={renderCategoryTick}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <XAxis
                                            dataKey="className"
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            height={70}
                                            tick={renderCategoryTick}
                                        />
                                        <YAxis
                                            domain={[
                                                0,
                                                maxClassTotal > 0
                                                    ? Math.ceil(maxClassTotal * 1.1)
                                                    : 10,
                                            ]}
                                        />
                                    </>
                                )}
                                <Tooltip
                                    content={<CustomClassTooltip />}
                                    cursor={{
                                        fill: 'rgba(128, 128, 128, 0.1)',
                                    }}
                                />
                                <Bar dataKey="total">
                                    {classTotals.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                COLORS[
                                                    index % COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tabel Setoran Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-y-auto h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>KELAS</TableHead>
                                        <TableHead>Jenis Sampah</TableHead>
                                        <TableHead className="text-right">
                                            Total Sampah
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classTotals.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center h-32"
                                            >
                                                Belum ada data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        classTotals.map((c) => (
                                            <TableRow
                                                key={c.className}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>{c.className}</TableCell>
                                            <TableCell>
                                                <div>{c.jenisList || '-'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Kategori: {c.categories || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Number(c.total || 0).toFixed(2)} kg
                                            </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Totals and Progression */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Perkembangan Sampah per Kelas {year}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border border-muted">
                            <Table className="min-w-[1000px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kelas</TableHead>
                                        {MONTHS.map((monthName) => (
                                            <TableHead key={monthName} className="text-right">
                                                {monthName.slice(0, 3)}
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-right">
                                            Total
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classProgress.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={14}
                                                className="text-center h-24"
                                            >
                                                Belum ada data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        classProgress.map((row) => (
                                            <TableRow
                                                key={row.kelas}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>{row.kelas}</TableCell>
                                                {row.months.map((value, idx) => (
                                                    <TableCell
                                                        key={`${row.kelas}-${idx}`}
                                                        className="text-right"
                                                    >
                                                        {Number(value).toFixed(2)}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-right font-semibold">
                                                    {Number(
                                                        row.months.reduce(
                                                            (sum, value) => sum + value,
                                                            0,
                                                        ),
                                                    ).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Guru Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Diagram Setoran Guru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={guruRanking}
                                layout={isMobileChart ? 'vertical' : 'horizontal'}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: isMobileChart ? 20 : -10,
                                    bottom: isMobileChart ? 20 : 50,
                                }}
                                barCategoryGap="20%"
                                barSize={isMobileChart ? 18 : 24}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                {isMobileChart ? (
                                    <>
                                        <XAxis
                                            type="number"
                                            domain={[
                                                0,
                                                maxGuruKg > 0
                                                    ? Math.ceil(maxGuruKg * 1.1)
                                                    : 10,
                                            ]}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="guruName"
                                            width={130}
                                            tick={renderCategoryTick}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <XAxis
                                            dataKey="guruName"
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            height={70}
                                            tick={renderCategoryTick}
                                        />
                                        <YAxis
                                            domain={[
                                                0,
                                                maxGuruKg > 0
                                                    ? Math.ceil(maxGuruKg * 1.1)
                                                    : 10,
                                            ]}
                                        />
                                    </>
                                )}
                                <Tooltip
                                    content={<CustomGuruTooltip />}
                                    cursor={{
                                        fill: 'rgba(128, 128, 128, 0.1)',
                                    }}
                                />
                                <Bar dataKey="totalKg">
                                    {guruRanking.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                COLORS[
                                                    index % COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tabel Setoran Guru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-y-auto h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead className="w-16 text-center">
                                            No
                                        </TableHead>
                                        <TableHead>Nama Guru</TableHead>
                                        <TableHead>Jenis Sampah</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">
                                            Total Sampah
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {guruRanking.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center h-32"
                                            >
                                                Belum ada data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        guruRanking.map((g, idx) => (
                                            <TableRow
                                                key={g.guruName}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="text-center font-medium">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell>{g.guruName}</TableCell>
                                            <TableCell>{g.wasteTypes || '-'}</TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">
                                                    {g.categories || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Number(g.totalKg || 0).toFixed(2)} kg
                                            </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Masyarakat Section */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tabel Setoran Masyarakat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-y-auto h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Jenis Sampah</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">
                                            Total Sampah
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {masyarakatTotals.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center h-32"
                                            >
                                                Belum ada data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        masyarakatTotals.map((row) => (
                                            <TableRow
                                                key={`${row.wasteType}-${row.category}`}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    {row.wasteType}
                                                </TableCell>
                                                <TableCell>
                                                    {row.category || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {Number(row.totalKg || 0).toFixed(2)} kg
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
