"use client";

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
import { useToast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getLaporanPerolehanTahunan,
  getPerkembanganSampahKelas,
  type LaporanBulanan,
} from "../actions";
import { MONTHS } from "./constants";

type KelasProgress = { kelas: string; months: number[] };

export function TabLaporanSispendik() {
  const { toast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState<LaporanBulanan[]>([]);
  const [progress, setProgress] = useState<KelasProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const years = useMemo(
    () =>
      Array.from(
        { length: 11 },
        (_, index) => new Date().getFullYear() - 5 + index,
      ),
    [],
  );

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const [overall, classes] = await Promise.all([
      getLaporanPerolehanTahunan(year),
      getPerkembanganSampahKelas(year),
    ]);
    if ("data" in overall && overall.data) setMonths(overall.data.months);
    else {
      setMonths([]);
      toast({
        title: "Gagal memuat laporan",
        description: overall.error,
        variant: "destructive",
      });
    }
    if ("data" in classes && classes.data) setProgress(classes.data);
    else {
      setProgress([]);
      toast({
        title: "Gagal memuat perkembangan kelas",
        description: classes.error,
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [toast, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const totalKg = months.reduce((total, row) => total + row.totalKg, 0);
  const totalValue = months.reduce((total, row) => total + row.totalValue, 0);
  const chartData = months.map((row) => ({
    ...row,
    name: MONTHS[row.month - 1],
  }));

  return (
    <div className="space-y-6">
      <div className="hidden print:block">
        <h2 className="text-xl font-bold">Laporan Sispendig SMPN 24 Padang</h2>
        <p className="text-sm text-muted-foreground">Tahun {year}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted-foreground">
          Cetak laporan lengkap beserta tabel rekap dan perkembangan kelas.
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(year)}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((item) => (
                <SelectItem key={item} value={String(item)}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="print-break-inside-avoid">
          <CardHeader>
            <CardTitle>Total Perolehan {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalKg.toLocaleString("id-ID")} kg
            </p>
          </CardContent>
        </Card>
        <Card className="print-break-inside-avoid">
          <CardHeader>
            <CardTitle>Nilai Perolehan {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Rp {totalValue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="print:hidden print-break-inside-avoid">
        <CardHeader>
          <CardTitle>Grafik Perolehan Sampah per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={70}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString("id-ID")} kg`,
                  "Total",
                ]}
              />
              <Bar dataKey="totalKg" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="print-break-inside-avoid">
        <CardHeader>
          <CardTitle>Tabel Perolehan Keseluruhan per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan</TableHead>
                  <TableHead className="text-right">
                    Total Sampah (kg)
                  </TableHead>
                  <TableHead className="text-right">Nilai (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{MONTHS[row.month - 1]}</TableCell>
                    <TableCell className="text-right">
                      {row.totalKg.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {row.totalValue.toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total {year}</TableCell>
                  <TableCell className="text-right">
                    {totalKg.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {totalValue.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="print-break-inside-avoid">
        <CardHeader>
          <CardTitle>Perkembangan Sampah per Kelas ({year})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Laporan Tahunan per kelas, menampilkan total sampah yang dikumpulkan
            setiap bulan dan total keseluruhan.
          </p>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto rounded border print:overflow-visible print:rounded-none print:border-0">
            <Table className="min-w-full print:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Kelas</TableHead>
                  {MONTHS.map((month) => (
                    <TableHead key={month} className="text-right">
                      {month.slice(0, 3)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14} className="py-6 text-center">
                      Memuat…
                    </TableCell>
                  </TableRow>
                ) : (
                  progress.map((row) => (
                    <TableRow key={row.kelas}>
                      <TableCell className="font-medium">{row.kelas}</TableCell>
                      {row.months.map((value, index) => (
                        <TableCell key={index} className="text-right">
                          {value.toLocaleString("id-ID")}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-medium">
                        {row.months
                          .reduce((total, value) => total + value, 0)
                          .toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden print:hidden">
            {loading ? (
              <div className="rounded-lg border border-muted p-4 text-center">
                Memuat…
              </div>
            ) : progress.length === 0 ? (
              <div className="rounded-lg border border-muted p-4 text-center">
                Belum ada data
              </div>
            ) : (
              progress.map((row) => {
                const totalValue = row.months.reduce(
                  (total, value) => total + value,
                  0,
                );
                return (
                  <Card key={row.kelas} className="border">
                    <CardHeader className="space-y-1 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-sm font-semibold">
                          {row.kelas}
                        </CardTitle>
                        <span className="text-sm font-semibold">
                          {totalValue.toLocaleString("id-ID")} kg
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total per bulan
                      </p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-2 p-4">
                      {row.months.map((value, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-muted px-3 py-2 text-xs"
                        >
                          <div className="font-medium">
                            {MONTHS[index].slice(0, 3)}
                          </div>
                          <div className="mt-1 text-right font-semibold">
                            {value.toLocaleString("id-ID")}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
