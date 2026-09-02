"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Calendar,
  Coins,
  GraduationCap,
  Loader2,
  Scale,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getPublicDashboardData } from "./actions";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const CLASS_COLORS = [
  "#10B981",
  "#059669",
  "#047857",
  "#0D9488",
  "#0891B2",
  "#0284C7",
  "#2563EB",
  "#4F46E5",
  "#7C3AED",
  "#9333EA",
  "#C026D3",
  "#DB2777",
];

const GURU_COLORS = [
  "#3B82F6",
  "#2563EB",
  "#1D4ED8",
  "#6366F1",
  "#4F46E5",
  "#8B5CF6",
  "#7C3AED",
  "#06B6D4",
];

const MASYARAKAT_COLORS = [
  "#F59E0B",
  "#D97706",
  "#B45309",
  "#EA580C",
  "#C2410C",
  "#E11D48",
  "#BE123C",
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

type TooltipPayload<T> = {
  value?: string | number;
  payload: T;
};

type TooltipProps<T> = {
  active?: boolean;
  payload?: TooltipPayload<T>[];
  label?: string | number;
};

type LevelFilter = "all" | "7" | "8" | "9";

function isLevelFilter(value: string): value is LevelFilter {
  return ["all", "7", "8", "9"].includes(value);
}

// --- CUSTOM TOOLTIPS ---
const CustomClassTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ClassRanking>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground border rounded-lg p-3 shadow-lg text-xs space-y-1 z-50">
        <p className="font-bold text-sm text-foreground">Kelas {label}</p>
        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
          Total: {Number(payload[0].value || 0).toFixed(2)} kg
        </p>
        <p className="text-muted-foreground">
          Nilai: Rp {Number(data.totalValue || 0).toLocaleString("id-ID")}
        </p>
        {data.jenisList && (
          <p className="text-muted-foreground max-w-xs truncate">
            Jenis: {data.jenisList}
          </p>
        )}
        {data.categories && (
          <p className="text-muted-foreground">
            Kategori: {data.categories}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomGuruTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<GuruRanking>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground border rounded-lg p-3 shadow-lg text-xs space-y-1 z-50">
        <p className="font-bold text-sm text-foreground">{label}</p>
        <p className="font-semibold text-blue-600 dark:text-blue-400">
          Total: {Number(payload[0].value || 0).toFixed(2)} kg
        </p>
        {data.wasteTypes && (
          <p className="text-muted-foreground max-w-xs truncate">
            Jenis: {data.wasteTypes}
          </p>
        )}
        {data.categories && (
          <p className="text-muted-foreground">
            Kategori: {data.categories}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomMasyarakatTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<MasyarakatTotal>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground border rounded-lg p-3 shadow-lg text-xs space-y-1 z-50">
        <p className="font-bold text-sm text-foreground">{label}</p>
        <p className="font-semibold text-amber-600 dark:text-amber-400">
          Total: {Number(payload[0].value || 0).toFixed(2)} kg
        </p>
        <p className="text-muted-foreground">
          Kategori: {data.category || "-"}
        </p>
      </div>
    );
  }
  return null;
};

export default function SispendikDashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [progressLevelFilter, setProgressLevelFilter] = useState<LevelFilter>("all");
  const [topRankerType, setTopRankerType] = useState<"kelas" | "guru">("kelas");

  const [rawClassTotals, setRawClassTotals] = useState<ClassRanking[]>([]);
  const [classProgress, setClassProgress] = useState<
    { kelas: string; months: number[] }[]
  >([]);
  const [guruRanking, setGuruRanking] = useState<GuruRanking[]>([]);
  const [masyarakatTotals, setMasyarakatTotals] = useState<MasyarakatTotal[]>([]);
  const [totalWaste, setTotalWaste] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [topWasteTypes, setTopWasteTypes] = useState<TopWasteType[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getPublicDashboardData(month, year);
        if (!isMounted) return;

        if (res.data) {
          setClassProgress(res.data.progress);
          setRawClassTotals(res.data.classTotals as ClassRanking[]);
          setTotalIncome(Number(res.data.summary.totalValue) || 0);
          setTotalWaste(Number(res.data.summary.totalKg) || 0);
          setTopWasteTypes(res.data.topWasteTypes as TopWasteType[]);
          setGuruRanking(res.data.guruRanking as GuruRanking[]);
          setMasyarakatTotals(res.data.masyarakatTotals as MasyarakatTotal[]);
        } else {
          setClassProgress([]);
          setRawClassTotals([]);
          setTotalIncome(0);
          setTotalWaste(0);
          setTopWasteTypes([]);
          setGuruRanking([]);
          setMasyarakatTotals([]);
        }
      } catch (err) {
        console.error("Failed to load sispendik dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [month, year]);

  const classTotals = useMemo(() => {
    return rawClassTotals.filter(
      (c) => levelFilter === "all" || c.className.startsWith(levelFilter),
    );
  }, [rawClassTotals, levelFilter]);

  const topClasses = useMemo(() => {
    return [...classTotals]
      .sort((a, b) => b.total - a.total)
      .filter((c) => c.total > 0)
      .slice(0, 3)
      .map((c) => c.className);
  }, [classTotals]);

  // Chart Dynamic Heights
  const classChartHeight = Math.max(340, classTotals.length * 26 + 40);
  const guruChartHeight = Math.max(180, guruRanking.length * 34 + 50);
  const masyarakatChartHeight = Math.max(180, masyarakatTotals.length * 34 + 50);

  // Filtered Matrix Progress
  const filteredProgress = classProgress.filter((row) =>
    progressLevelFilter === "all"
      ? true
      : row.kelas.startsWith(progressLevelFilter),
  );
  const monthlyTotals = Array.from({ length: 12 }, (_, monthIdx) =>
    filteredProgress.reduce(
      (sum, row) => sum + (row.months[monthIdx] || 0),
      0,
    ),
  );
  const grandTotal = monthlyTotals.reduce((sum, val) => sum + val, 0);

  return (
    <div className="relative flex flex-col gap-3.5 py-1.5 sm:gap-5 sm:py-3">
      {loading && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-card border shadow-lg rounded-xl px-5 py-3 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Memuat data rekapitulasi...</span>
          </div>
        </div>
      )}

      {/* HEADER & FILTER BAR */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b pb-2.5 sm:pb-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-2xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Dashboard Rekapitulasi Sispendik
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Periode: {MONTHS[month - 1]} {year}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[120px] sm:w-[125px] h-8 text-xs sm:h-9 sm:text-sm">
              <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, idx) => (
                <SelectItem key={m} value={(idx + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(year)}
            onValueChange={(v) => setYear(parseInt(v))}
          >
            <SelectTrigger className="w-[90px] sm:w-[95px] h-8 text-xs sm:h-9 sm:text-sm">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={levelFilter}
            onValueChange={(v) => {
              if (isLevelFilter(v)) setLevelFilter(v);
            }}
          >
            <SelectTrigger className="w-[110px] sm:w-[115px] h-8 text-xs sm:h-9 sm:text-sm">
              <GraduationCap className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Tingkat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkat</SelectItem>
              <SelectItem value="7">Kelas 7</SelectItem>
              <SelectItem value="8">Kelas 8</SelectItem>
              <SelectItem value="9">Kelas 9</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {/* Card 1: Total Sampah */}
        <Card className="border-emerald-200/70 bg-emerald-50/50 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <CardHeader className="p-3 sm:p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Sampah
              </CardTitle>
              <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 sm:text-2xl pt-0.5">
              {Number(totalWaste || 0).toFixed(2)}{" "}
              <span className="text-xs font-medium text-muted-foreground">kg</span>
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 pt-0.5 sm:pt-1 text-[11px] text-muted-foreground">
            Bulan {MONTHS[month - 1]} {year}
          </CardContent>
        </Card>

        {/* Card 2: Total Pendapatan */}
        <Card className="border-teal-200/70 bg-teal-50/50 shadow-sm dark:border-teal-900/50 dark:bg-teal-950/20">
          <CardHeader className="p-3 sm:p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Pendapatan
              </CardTitle>
              <Coins className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-lg font-bold tracking-tight text-teal-950 dark:text-teal-100 sm:text-2xl pt-0.5">
              Rp {totalIncome.toLocaleString("id-ID")}
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 pt-0.5 sm:pt-1 text-[11px] text-muted-foreground">
            Estimasi nilai ekonomis
          </CardContent>
        </Card>

        {/* Card 3: Kelas / Guru Unggulan */}
        <Card className="border-blue-200/70 bg-blue-50/50 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20">
          <CardHeader className="p-3 sm:p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {topRankerType === "kelas" ? "Kelas Teratas" : "Guru Teratas"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px] text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() =>
                  setTopRankerType(topRankerType === "kelas" ? "guru" : "kelas")
                }
              >
                Ganti ke {topRankerType === "kelas" ? "Guru" : "Kelas"}
              </Button>
            </div>
            <div className="min-h-[26px] flex items-center gap-1.5 flex-wrap pt-0.5">
              {topRankerType === "kelas" ? (
                topClasses.length > 0 ? (
                  topClasses.map((c, i) => (
                    <Badge
                      key={c}
                      variant="secondary"
                      className="bg-blue-100/80 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 text-xs px-2 py-0.5 font-bold"
                    >
                      {i === 0 && <Trophy className="h-3 w-3 mr-1 text-amber-500" />}
                      {c}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Belum ada data</span>
                )
              ) : guruRanking.length > 0 ? (
                <div className="text-xs font-medium space-y-0.5">
                  <span className="font-semibold text-foreground">
                    {guruRanking[0].guruName}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    ({Number(guruRanking[0].totalKg || 0).toFixed(1)} kg)
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Belum ada data</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 pt-0.5 sm:pt-1 text-[11px] text-muted-foreground">
            Top kontributor setoran
          </CardContent>
        </Card>

        {/* Card 4: Jenis Sampah Teratas */}
        <Card className="border-amber-200/70 bg-amber-50/50 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardHeader className="p-3 sm:p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sampah Dominan
              </CardTitle>
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-h-[26px] pt-0.5">
              {topWasteTypes.length > 0 ? (
                <p className="text-sm font-bold text-amber-950 dark:text-amber-100 truncate">
                  {topWasteTypes[0].wasteType}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({Number(topWasteTypes[0].totalKg || 0).toFixed(1)} kg)
                  </span>
                </p>
              ) : (
                <span className="text-sm text-muted-foreground">Belum ada data</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 pt-0.5 sm:pt-1 text-[11px] text-muted-foreground">
            Volume sampah tertinggi
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 1. MATRIKS PERKEMBANGAN SAMPAH PER KELAS (TAHUNAN)        */}
      {/* ========================================================= */}
      <Card className="shadow-sm border rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 space-y-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Matriks Perkembangan Sampah per Kelas ({year})
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rekap perolehan sampah bulanan dari Januari hingga Desember dalam satuan kilogram (kg)
              </p>
            </div>
            <Badge variant="secondary" className="w-fit text-xs self-start sm:self-auto">
              Tahun {year}
            </Badge>
          </div>

          {/* FILTER KELAS POSISI CENTER DI CARD TABLE */}
          <div className="flex flex-col items-center justify-center gap-1.5 pt-1 border-t border-border/40">
            <div className="flex items-center justify-center gap-1 bg-muted/70 p-1 rounded-lg border">
              <Button
                type="button"
                variant={progressLevelFilter === "all" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs rounded-md"
                onClick={() => setProgressLevelFilter("all")}
              >
                Semua
              </Button>
              <Button
                type="button"
                variant={progressLevelFilter === "7" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs rounded-md"
                onClick={() => setProgressLevelFilter("7")}
              >
                Kelas 7
              </Button>
              <Button
                type="button"
                variant={progressLevelFilter === "8" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs rounded-md"
                onClick={() => setProgressLevelFilter("8")}
              >
                Kelas 8
              </Button>
              <Button
                type="button"
                variant={progressLevelFilter === "9" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs rounded-md"
                onClick={() => setProgressLevelFilter("9")}
              >
                Kelas 9
              </Button>
            </div>

            {/* Mobile swipe helper */}
            <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground pt-0.5 sm:hidden px-0.5">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                ↔ Geser tabel untuk bulan lainnya
              </span>
              <span className="text-[10px]">
                {filteredProgress.length} Kelas
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2.5 sm:p-4 pt-0 sm:pt-0">
          <div className="relative overflow-x-auto rounded-lg border border-border/70 shadow-inner max-h-[440px] scrollbar-thin">
            <Table className="min-w-[760px] sm:min-w-[860px] text-xs border-collapse">
              <TableHeader className="sticky top-0 z-30 bg-muted">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="sticky left-0 z-40 bg-muted font-bold text-left w-16 px-3 py-2.5 border-r border-border shadow-[1px_0_0_0_hsl(var(--border))]">
                    Kelas
                  </TableHead>
                  {MONTHS.map((monthName) => (
                    <TableHead
                      key={monthName}
                      className="font-semibold text-right min-w-[48px] sm:min-w-[58px] px-2 py-2.5 border-r border-border/40 last:border-r-0"
                    >
                      {monthName.slice(0, 3)}
                    </TableHead>
                  ))}
                  <TableHead className="sticky right-0 z-40 bg-emerald-100 dark:bg-emerald-950 font-bold text-right min-w-[70px] sm:min-w-[82px] px-3 py-2.5 border-l border-border text-emerald-900 dark:text-emerald-200 shadow-[-1px_0_0_0_hsl(var(--border))]">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProgress.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      className="text-center h-20 text-muted-foreground"
                    >
                      Belum ada data perkembangan tahunan untuk tingkat ini
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProgress.map((row) => {
                    const rowTotal = row.months.reduce(
                      (sum, value) => sum + value,
                      0,
                    );
                    return (
                      <TableRow
                        key={row.kelas}
                        className="group hover:bg-muted/30 border-b border-border/40"
                      >
                        <TableCell className="sticky left-0 z-20 bg-background group-hover:bg-muted/50 font-bold px-3 py-2 text-left border-r border-border/60 shadow-[1px_0_0_0_hsl(var(--border))]">
                          {row.kelas}
                        </TableCell>
                        {row.months.map((value, idx) => (
                          <TableCell
                            key={`${row.kelas}-${idx}`}
                            className={`text-right px-2 py-2 border-r border-border/20 last:border-r-0 font-mono text-[11px] sm:text-xs tabular-nums ${
                              value > 0
                                ? "font-medium text-foreground"
                                : "text-muted-foreground/40"
                            }`}
                          >
                            {value > 0 ? Number(value).toFixed(1) : "-"}
                          </TableCell>
                        ))}
                        <TableCell className="sticky right-0 z-20 bg-emerald-50 dark:bg-emerald-950 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 font-bold text-right px-3 py-2 text-emerald-700 dark:text-emerald-300 border-l border-border/60 shadow-[-1px_0_0_0_hsl(var(--border))] font-mono text-[11px] sm:text-xs tabular-nums">
                          {rowTotal > 0 ? Number(rowTotal).toFixed(2) : "0"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              {filteredProgress.length > 0 && (
                <tfoot className="sticky bottom-0 z-30 bg-muted/95 backdrop-blur-md font-bold border-t-2 border-border shadow-[0_-1px_0_0_hsl(var(--border))]">
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="sticky left-0 z-40 bg-muted/95 backdrop-blur-md font-bold px-3 py-2 text-left border-r border-border shadow-[1px_0_0_0_hsl(var(--border))] text-xs">
                      Total
                    </TableCell>
                    {monthlyTotals.map((sumMonth, idx) => (
                      <TableCell
                        key={`total-month-${idx}`}
                        className="text-right px-2 py-2 font-bold font-mono text-[11px] sm:text-xs tabular-nums text-foreground border-r border-border/40 last:border-r-0"
                      >
                        {sumMonth > 0 ? Number(sumMonth).toFixed(1) : "-"}
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 z-40 bg-emerald-100/95 dark:bg-emerald-900/90 backdrop-blur-md font-extrabold text-right px-3 py-2 text-emerald-800 dark:text-emerald-200 border-l border-border shadow-[-1px_0_0_0_hsl(var(--border))] font-mono text-xs sm:text-sm tabular-nums">
                      {grandTotal > 0 ? Number(grandTotal).toFixed(2) : "0"}
                    </TableCell>
                  </TableRow>
                </tfoot>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 2. DIAGRAM SETORAN KELAS (SISWA)                          */}
      {/* ========================================================= */}
      <Card className="shadow-sm border rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-1.5 sm:pb-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold sm:text-lg flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Diagram Setoran Kelas (Siswa)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Semua kelas 7A - 9H ditampilkan secara vertikal, jumlah setoran (kg) horizontal ke samping.
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-[11px] font-normal self-start sm:self-auto">
              {levelFilter === "all" ? "Semua Tingkat (7-9)" : `Tingkat ${levelFilter}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
          <div className="w-full">
            {(() => {
              const reversedClassTotals = [...classTotals].reverse();
              return (
                <ResponsiveContainer width="100%" height={classChartHeight}>
                  <BarChart
                    data={reversedClassTotals}
                    layout="vertical"
                    margin={{
                      top: 8,
                      right: 24,
                      left: 0,
                      bottom: 8,
                    }}
                    barCategoryGap="15%"
                    barSize={14}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis
                      type="number"
                      domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.15) : 10)]}
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      tickFormatter={(val) => `${val} kg`}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="className"
                      width={42}
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomClassTooltip />}
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                      {reversedClassTotals.map((entry, index) => (
                        <Cell
                          key={`cell-class-${entry.className}-${index}`}
                          fill={entry.total > 0 ? CLASS_COLORS[index % CLASS_COLORS.length] : "hsl(var(--muted))"}
                          opacity={entry.total > 0 ? 0.9 : 0.4}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 3 & 4. DIAGRAM SETORAN GURU & MASYARAKAT                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-2">
        {/* 3. DIAGRAM SETORAN GURU & TENAGA KEPENDIDIKAN */}
        <Card className="shadow-sm border rounded-xl overflow-hidden">
          <CardHeader className="p-3 sm:p-4 pb-1.5 sm:pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Diagram Setoran Guru & Tenaga Kependidikan
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Grafik setoran sampah mandiri oleh guru dan staf
                </p>
              </div>
              <Badge variant="outline" className="text-[11px] font-normal">
                {guruRanking.length} Guru
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            {guruRanking.length === 0 ? (
              <div className="flex h-36 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                Belum ada data setoran guru pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={guruChartHeight}>
                <BarChart
                  data={guruRanking}
                  layout="vertical"
                  margin={{
                    top: 8,
                    right: 24,
                    left: 10,
                    bottom: 8,
                  }}
                  barCategoryGap="20%"
                  barSize={16}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis
                    type="number"
                    domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.15) : 5)]}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickFormatter={(val) => `${val} kg`}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="guruName"
                    width={125}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomGuruTooltip />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  />
                  <Bar dataKey="totalKg" radius={[0, 4, 4, 0]}>
                    {guruRanking.map((_, index) => (
                      <Cell
                        key={`cell-guru-${index}`}
                        fill={GURU_COLORS[index % GURU_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 4. DIAGRAM SETORAN MASYARAKAT */}
        <Card className="shadow-sm border rounded-xl overflow-hidden">
          <CardHeader className="p-3 sm:p-4 pb-1.5 sm:pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Diagram Setoran Masyarakat
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Grafik setoran sampah berdasarkan jenis dari masyarakat
                </p>
              </div>
              <Badge variant="outline" className="text-[11px] font-normal">
                {masyarakatTotals.length} Jenis Sampah
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            {masyarakatTotals.length === 0 ? (
              <div className="flex h-36 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                Belum ada data setoran masyarakat pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={masyarakatChartHeight}>
                <BarChart
                  data={masyarakatTotals}
                  layout="vertical"
                  margin={{
                    top: 8,
                    right: 24,
                    left: 10,
                    bottom: 8,
                  }}
                  barCategoryGap="20%"
                  barSize={16}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis
                    type="number"
                    domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.15) : 5)]}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickFormatter={(val) => `${val} kg`}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="wasteType"
                    width={125}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomMasyarakatTooltip />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  />
                  <Bar dataKey="totalKg" radius={[0, 4, 4, 0]}>
                    {masyarakatTotals.map((_, index) => (
                      <Cell
                        key={`cell-masyarakat-${index}`}
                        fill={MASYARAKAT_COLORS[index % MASYARAKAT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 5. TABEL RINCIAN SETORAN KELAS                            */}
      {/* ========================================================= */}
      <Card className="shadow-sm border rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-2.5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Tabel Rincian Setoran Kelas
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Daftar lengkap perolehan sampah dan nilai per kelas
              </p>
            </div>
            <Badge variant="outline" className="text-[11px] font-normal">
              {classTotals.length} Kelas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-2.5 sm:p-4 pt-0 sm:pt-0">
          <div className="relative max-h-72 overflow-y-auto rounded-lg border text-xs sm:text-sm scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-20 font-bold px-3 py-2 sm:py-2.5">Kelas</TableHead>
                  <TableHead className="px-3 py-2 sm:py-2.5">Jenis & Kategori Sampah</TableHead>
                  <TableHead className="text-right px-3 py-2 sm:py-2.5">Total Sampah</TableHead>
                  <TableHead className="text-right px-3 py-2 sm:py-2.5">Nilai Rupiah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classTotals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-20 text-muted-foreground">
                      Belum ada data setoran kelas
                    </TableCell>
                  </TableRow>
                ) : (
                  classTotals.map((c) => (
                    <TableRow key={c.className} className="hover:bg-muted/40 transition-colors border-b last:border-b-0">
                      <TableCell className="font-semibold px-3 py-2 sm:py-2.5">{c.className}</TableCell>
                      <TableCell className="px-3 py-2 sm:py-2.5">
                        <div className="font-medium">{c.jenisList || "-"}</div>
                        {c.categories && (
                          <span className="text-[11px] text-muted-foreground block">
                            Kategori: {c.categories}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium px-3 py-2 sm:py-2.5 tabular-nums">
                        {Number(c.total || 0).toFixed(2)} kg
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400 px-3 py-2 sm:py-2.5 tabular-nums">
                        Rp {Number(c.totalValue || 0).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 6 & 7. TABEL SETORAN GURU & MASYARAKAT                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-2">
        {/* 6. TABEL SETORAN GURU & TENAGA KEPENDIDIKAN */}
        <Card className="shadow-sm border rounded-xl overflow-hidden">
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-2.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Tabel Setoran Guru & Tenaga Kependidikan
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-normal">
                {guruRanking.length} Guru
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2.5 sm:p-4 pt-0 sm:pt-0">
            <div className="relative max-h-64 overflow-y-auto rounded-lg border text-xs sm:text-sm scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-10 text-center px-2 py-2 sm:py-2.5">No</TableHead>
                    <TableHead className="px-3 py-2 sm:py-2.5">Nama Guru / Staf</TableHead>
                    <TableHead className="px-3 py-2 sm:py-2.5">Jenis Sampah</TableHead>
                    <TableHead className="text-right px-3 py-2 sm:py-2.5">Total (kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guruRanking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-20 text-muted-foreground">
                        Belum ada data setoran guru
                      </TableCell>
                    </TableRow>
                  ) : (
                    guruRanking.map((g, idx) => (
                      <TableRow key={g.guruName} className="hover:bg-muted/40 transition-colors border-b last:border-b-0">
                        <TableCell className="text-center font-medium text-muted-foreground px-2 py-2 sm:py-2.5">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium px-3 py-2 sm:py-2.5">{g.guruName}</TableCell>
                        <TableCell className="px-3 py-2 sm:py-2.5">
                          <div>{g.wasteTypes || "-"}</div>
                          {g.categories && (
                            <span className="text-[11px] text-muted-foreground block">
                              {g.categories}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400 px-3 py-2 sm:py-2.5 tabular-nums">
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

        {/* 7. TABEL SETORAN MASYARAKAT */}
        <Card className="shadow-sm border rounded-xl overflow-hidden">
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-2.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Tabel Setoran Masyarakat
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-normal">
                {masyarakatTotals.length} Jenis
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2.5 sm:p-4 pt-0 sm:pt-0">
            <div className="relative max-h-64 overflow-y-auto rounded-lg border text-xs sm:text-sm scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-10 text-center px-2 py-2 sm:py-2.5">No</TableHead>
                    <TableHead className="px-3 py-2 sm:py-2.5">Jenis Sampah</TableHead>
                    <TableHead className="px-3 py-2 sm:py-2.5">Kategori</TableHead>
                    <TableHead className="text-right px-3 py-2 sm:py-2.5">Total (kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {masyarakatTotals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-20 text-muted-foreground">
                        Belum ada data setoran masyarakat
                      </TableCell>
                    </TableRow>
                  ) : (
                    masyarakatTotals.map((row, idx) => (
                      <TableRow
                        key={`${row.wasteType}-${row.category}-${idx}`}
                        className="hover:bg-muted/40 transition-colors border-b last:border-b-0"
                      >
                        <TableCell className="text-center font-medium text-muted-foreground px-2 py-2 sm:py-2.5">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium px-3 py-2 sm:py-2.5">{row.wasteType}</TableCell>
                        <TableCell className="px-3 py-2 sm:py-2.5">
                          <Badge variant="outline" className="text-[11px] font-normal capitalize">
                            {row.category || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-amber-600 dark:text-amber-400 px-3 py-2 sm:py-2.5 tabular-nums">
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
