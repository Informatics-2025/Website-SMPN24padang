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
    getAggregatedData,
    getClassRanking,
    AggregatedData,
    getTotalsSummary,
    getTopWasteTypes,
    getGuruRanking,
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
import { Spinner } from '@/components/ui/spinner';

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
type TopWasteType = { wasteType: string; totalKg: number; totalValue: number };
type ClassRanking = {
    className: string;
    total: number;
    totalValue: number;
    jenisList: string | null;
};
type GuruRanking = {
    guruName: string;
    totalKg: number;
    wasteTypes: string | null;
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
            </div>
        );
    }
    return null;
};

export default function SispendikDashboard() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
    const [classRanking, setClassRanking] = useState<ClassRanking[]>([]);
    const [guruRanking, setGuruRanking] = useState<GuruRanking[]>([]);
    const [totalWaste, setTotalWaste] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [topClasses, setTopClasses] = useState<string[]>([]);
    const [topWasteTypes, setTopWasteTypes] = useState<TopWasteType[]>([]);
    const [levelFilter, setLevelFilter] = useState<'all' | '7' | '8' | '9'>(
        'all',
    );
    const [topRankerType, setTopRankerType] = useState<'kelas' | 'guru'>(
        'kelas',
    );
    const [loading, setLoading] = useState(true);

    const maxClassTotal =
        classRanking.length > 0
            ? Math.max(...classRanking.map((c) => c.total))
            : 0;
    const maxGuruKg =
        guruRanking.length > 0
            ? Math.max(...guruRanking.map((g) => g.totalKg))
            : 0;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [aggData, rankData, summary, topWasteRes, guruRankData] =
                await Promise.all([
                    getAggregatedData(month, year),
                    getClassRanking(month, year),
                    getTotalsSummary(month, year),
                    getTopWasteTypes(month, year),
                    getGuruRanking(month, year),
                ]);

            if (aggData.data) setAggregatedData(aggData.data);

            if (
                rankData.data &&
                Array.isArray(rankData.data) &&
                rankData.data.length > 0
            ) {
                const typedData = rankData.data as ClassRanking[];
                const filteredData = typedData.filter(
                    (c) =>
                        levelFilter === 'all' ||
                        c.className.startsWith(levelFilter),
                );
                setClassRanking(filteredData);
                setTopClasses(filteredData.slice(0, 3).map((c) => c.className));
            } else {
                setClassRanking([]);
                setTopClasses([]);
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
            setLoading(false);
        };

        fetchData();
    }, [month, year, levelFilter]);

    return (
        <div className="space-y-8 pt-6 relative">
            {loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
                    <Spinner className="w-10 h-10" />
                </div>
            )}
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
                                    ? 'Top 3 Kelas'
                                    : 'Top 3 Guru'}
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
                        <div className="text-lg font-bold pt-2">
                            {topRankerType === 'kelas' ? (
                                topClasses.length > 0 ? (
                                    topClasses.map((c, i) => (
                                        <div key={i}>
                                            {i + 1}. {c}
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
                                        <p>
                                            {i + 1}. {g.guruName}
                                        </p>
                                        <p className="text-sm font-normal text-muted-foreground">
                                            {Number(g.totalKg || 0).toFixed(
                                                2,
                                            )}{' '}
                                            kg
                                        </p>
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
                        <div className="space-y-2 pt-2">
                            {topWasteTypes.length > 0 ? (
                                topWasteTypes.map((w, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-baseline"
                                    >
                                        <p className="font-bold text-sm">
                                            {i + 1}. {w.wasteType}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {Number(w.totalKg || 0).toFixed(
                                                2,
                                            )}{' '}
                                            kg
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

            {/* Class Ranking Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Diagram Setoran Kelas</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Select
                                value={String(month)}
                                onValueChange={(v) => setMonth(parseInt(v))}
                            >
                                <SelectTrigger className="w-auto text-xs h-8">
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
                                <SelectTrigger className="w-auto text-xs h-8">
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
                                <SelectTrigger className="w-auto text-xs h-8">
                                    <SelectValue placeholder="Tingkat" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua
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
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={classRanking}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: -10,
                                    bottom: 50,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="className"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis
                                    domain={[
                                        0,
                                        maxClassTotal > 0
                                            ? Math.ceil(maxClassTotal * 1.1)
                                            : 10,
                                    ]}
                                />
                                <Tooltip
                                    content={<CustomClassTooltip />}
                                    cursor={{
                                        fill: 'rgba(128, 128, 128, 0.1)',
                                    }}
                                />
                                <Bar dataKey="total">
                                    {classRanking.map((entry, index) => (
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
                        <CardTitle>Tabel Peringkat Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-y-auto h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead className="w-16 text-center">
                                            No
                                        </TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead className="text-right">
                                            Total Sampah
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Total Pendapatan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classRanking.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center h-32"
                                            >
                                                Belum ada data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        classRanking.map((c, idx) => (
                                            <TableRow
                                                key={c.className}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="text-center font-medium">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {c.className}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {Number(
                                                        c.total || 0,
                                                    ).toFixed(2)}{' '}
                                                    kg
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    Rp{' '}
                                                    {Number(
                                                        c.totalValue || 0,
                                                    ).toLocaleString(
                                                        'id-ID',
                                                    )}
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

            {/* Guru Ranking Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Diagram Setoran Guru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={guruRanking}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: -10,
                                    bottom: 50,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="guruName"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis
                                    domain={[
                                        0,
                                        maxGuruKg > 0
                                            ? Math.ceil(maxGuruKg * 1.1)
                                            : 10,
                                    ]}
                                />
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
                        <CardTitle>Tabel Peringkat Guru</CardTitle>
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
                                        <TableHead className="text-right">
                                            Total Sampah
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {guruRanking.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
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
                                                <TableCell>
                                                    {g.guruName}
                                                </TableCell>
                                                <TableCell>
                                                    {g.wasteTypes || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {Number(
                                                        g.totalKg || 0,
                                                    ).toFixed(2)}{' '}
                                                    kg
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
