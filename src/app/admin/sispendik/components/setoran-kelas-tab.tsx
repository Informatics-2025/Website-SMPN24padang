'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Printer, Save, RotateCcw } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
    createJenisSampah,
    deleteJenisSampah,
    getClassTotals,
    getTotalsSummary,
    updateJenisSampah,
    getSampahKelasByKelasMonth,
    createSampahKelas,
    updateSampahKelas,
    deleteSampahKelasRecord,
    resetClassDepositsByMonth,
} from '../actions';

import { MONTHS } from './constants';
import type { JenisSampah, Kelas, SetoranEntry } from './types';

interface TabSetoranKelasProps {
    kelas: Kelas[];
    jenisSampah: JenisSampah[];
}

export function TabSetoranKelas({ kelas, jenisSampah }: TabSetoranKelasProps) {
    const { toast } = useToast();

    const [localJenis, setLocalJenis] = useState<JenisSampah[]>(jenisSampah);
    const [editingJenis, setEditingJenis] = useState<JenisSampah | null>(null);
    const [jenisModalOpen, setJenisModalOpen] = useState(false);
    const [newJenisName, setNewJenisName] = useState('');
    const [newJenisPrice, setNewJenisPrice] = useState('');

    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1,
    );
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear(),
    );
    const [tableData, setTableData] = useState<any[]>([]);
    const [sumKg, setSumKg] = useState<number>(0);
    const [sumValue, setSumValue] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [tingkatFilter, setTingkatFilter] = useState<'all' | '7' | '8' | '9'>(
        'all',
    );

    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 2020 + 6 },
        (_, i) => 2020 + i,
    );

    const buildEmptyRows = useMemo(
        () => () =>
            (kelas || [])
                .slice()
                .sort((a, b) =>
                    a.tingkat === b.tingkat
                        ? a.huruf.localeCompare(b.huruf)
                        : a.tingkat - b.tingkat,
                )
                .map((k) => ({
                    kelasId: k.id,
                    tingkat: k.tingkat,
                    huruf: k.huruf,
                    total: 0,
                    jenisList: null as string | null,
                })),
        [kelas],
    );

    const [manageOpen, setManageOpen] = useState(false);
    const [manageClass, setManageClass] = useState<Kelas | null>(null);
    const [entries, setEntries] = useState<SetoranEntry[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<SetoranEntry | null>(
        null,
    );

    const [deleteJenisDialogOpen, setDeleteJenisDialogOpen] = useState(false);
    const [selectedJenis, setSelectedJenis] = useState<JenisSampah | null>(
        null,
    );

    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any | null>(null);

    const [addJenisId, setAddJenisId] = useState<string>('');
    const [addJumlah, setAddJumlah] = useState<string>('');

    const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
    const [editJenisId, setEditJenisId] = useState<string>('');
    const [editJumlah, setEditJumlah] = useState<string>('');

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalJenis(jenisSampah);
    }, [jenisSampah]);

    const filteredRows = useMemo(() => {
        let rows = tableData as any[];
        if (tingkatFilter !== 'all') {
            rows = rows.filter((r) => String(r.tingkat) === tingkatFilter);
        }
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            rows = rows.filter(
                (r) =>
                    `${r.tingkat}${r.huruf}`.toLowerCase().includes(q) ||
                    String(r.jenisList || '')
                        .toLowerCase()
                        .includes(q),
            );
        }
        return rows;
    }, [tableData, tingkatFilter, searchQuery]);

    const filteredSumKg = useMemo(
        () => filteredRows.reduce((s, r) => s + Number(r.total || 0), 0),
        [filteredRows],
    );
    const filteredSumValue = useMemo(
        () => filteredRows.reduce((s, r) => s + Number(r.totalValue || 0), 0),
        [filteredRows],
    );

    const handleCreateOrUpdateJenis = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newJenisName.trim();
        const price = parseFloat(newJenisPrice || '0');
        if (!name || !price) {
            toast({
                title: 'Error',
                description: 'Nama dan harga wajib diisi',
                variant: 'destructive',
            });
            return;
        }

        const res = editingJenis
            ? await updateJenisSampah(editingJenis.id, {
                  namaSampah: name,
                  hargaPerKg: price,
              })
            : await createJenisSampah({ namaSampah: name, hargaPerKg: price });

        if (res.success && res.data) {
            toast({
                title: 'Sukses',
                description: editingJenis
                    ? 'Jenis sampah diperbarui'
                    : 'Jenis sampah ditambahkan',
            });

            if (editingJenis) {
                setLocalJenis((prev) =>
                    prev.map((j) => (j.id === editingJenis.id ? res.data! : j)),
                );
            } else {
                setLocalJenis((prev) => [...prev, res.data!]);
            }

            setJenisModalOpen(false);
            setEditingJenis(null);
            setNewJenisName('');
            setNewJenisPrice('');
        } else {
            toast({
                title: 'Error',
                description: (res as any).error || 'Operasi gagal',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteJenis = async (id: number) => {
        const res = await deleteJenisSampah(id);
        if (res.success) {
            toast({ title: 'Sukses', description: 'Jenis sampah dihapus' });
            setLocalJenis((prev) => prev.filter((j) => j.id !== id));
        } else {
            toast({
                title: 'Error',
                description: res.error || 'Gagal menghapus',
                variant: 'destructive',
            });
        }
    };

    const fetchRecap = useCallback(async () => {
        const [totals, summary] = await Promise.all([
            getClassTotals(selectedMonth, selectedYear),
            getTotalsSummary(selectedMonth, selectedYear),
        ]);
        if (
            totals.data &&
            Array.isArray(totals.data) &&
            totals.data.length > 0
        ) {
            setTableData(totals.data);
        } else {
            setTableData(buildEmptyRows());
        }
        if (summary.data) {
            setSumKg(Number((summary.data as any).totalKg || 0));
            setSumValue(Number((summary.data as any).totalValue || 0));
        }
    }, [selectedMonth, selectedYear, buildEmptyRows]);

    useEffect(() => {
        setTableData(buildEmptyRows());
        fetchRecap();
    }, [buildEmptyRows, fetchRecap]);

    useEffect(() => {
        fetchRecap();
    }, [fetchRecap]);

    const openManage = async (k: Kelas) => {
        setManageClass(k);
        setManageOpen(true);
        await fetchEntries(k.id);
    };

    const fetchEntries = async (kelasId: number) => {
        setLoadingEntries(true);
        const res = await getSampahKelasByKelasMonth(
            kelasId,
            selectedMonth,
            selectedYear,
        );
        if ((res as any).data) setEntries((res as any).data as SetoranEntry[]);
        setLoadingEntries(false);
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manageClass) return;
        const jenisId = parseInt(addJenisId || '0');
        const jumlah = parseFloat(addJumlah || '0');
        if (!jenisId || !jumlah) {
            toast({
                title: 'Error',
                description: 'Pilih jenis dan isi jumlah',
                variant: 'destructive',
            });
            return;
        }
        const createdAt = new Date(selectedYear, selectedMonth - 1, 15);
        const res = await createSampahKelas({
            kelasId: manageClass.id,
            jenisSampahId: jenisId,
            jumlahKg: jumlah,
            createdAt,
        });
        if ((res as any).success) {
            toast({ title: 'Sukses', description: 'Setoran ditambahkan' });
            setAddJenisId('');
            setAddJumlah('');
            await fetchEntries(manageClass.id);
            await fetchRecap();
        } else {
            toast({
                title: 'Error',
                description: (res as any).error || 'Gagal menambah setoran',
                variant: 'destructive',
            });
        }
    };

    const startEditEntry = (entry: SetoranEntry) => {
        setEditingEntryId(entry.id);
        setEditJenisId(String(entry.jenisSampahId));
        setEditJumlah(String(entry.jumlahKg));
    };

    const cancelEditEntry = () => {
        setEditingEntryId(null);
        setEditJenisId('');
        setEditJumlah('');
    };

    const handleSaveEntry = async (entryId: number) => {
        const jenisId = parseInt(editJenisId || '0');
        const jumlah = parseFloat(editJumlah || '0');
        if (!jenisId || !jumlah) {
            toast({
                title: 'Error',
                description: 'Pilih jenis dan isi jumlah',
                variant: 'destructive',
            });
            return;
        }
        const res = await updateSampahKelas(entryId, {
            jenisSampahId: jenisId,
            jumlahKg: jumlah,
        });
        if ((res as any).success) {
            toast({ title: 'Sukses', description: 'Setoran diperbarui' });
            cancelEditEntry();
            if (manageClass) {
                await fetchEntries(manageClass.id);
                await fetchRecap();
            }
        } else {
            toast({
                title: 'Error',
                description: (res as any).error || 'Gagal memperbarui setoran',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteEntry = async (entryId: number) => {
        const res = await deleteSampahKelasRecord(entryId);
        if ((res as any).success) {
            toast({ title: 'Sukses', description: 'Setoran dihapus' });
            if (manageClass) {
                await fetchEntries(manageClass.id);
                await fetchRecap();
            }
        } else {
            toast({
                title: 'Error',
                description: (res as any).error || 'Gagal menghapus setoran',
                variant: 'destructive',
            });
        }
    };

    const handlePrintRecap = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 print:break-inside-avoid">
                    <CardHeader className="flex items-center justify-end gap-2 sm:flex-row flex-col">
                        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto print:hidden">
                            <Select
                                value={selectedMonth.toString()}
                                onValueChange={(v) =>
                                    setSelectedMonth(parseInt(v))
                                }
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Pilih bulan" />
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
                                value={String(selectedYear)}
                                onValueChange={(v) =>
                                    setSelectedYear(parseInt(v))
                                }
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue placeholder="Pilih tahun" />
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
                                value={tingkatFilter}
                                onValueChange={(v) =>
                                    setTingkatFilter(v as any)
                                }
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Tingkat" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Kelas
                                    </SelectItem>
                                    <SelectItem value="7">Kelas 7</SelectItem>
                                    <SelectItem value="8">Kelas 8</SelectItem>
                                    <SelectItem value="9">Kelas 9</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Cari kelas/jenis..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-44"
                            />
                            <Button onClick={handlePrintRecap}>
                                <Printer className="h-4 w-4 mr-2" /> Cetak
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div ref={printRef} className="print:block">
                            <div className="hidden print:block text-center mb-4">
                                <h1 className="text-xl font-bold">
                                    Laporan Bank Sampah
                                </h1>
                            </div>
                            <div className="overflow-x-auto rounded border print:overflow-visible print:rounded-none print:border-0">
                                <Table className="min-w-full w-full print:min-w-0">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">
                                                No
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">
                                                Kelas
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">
                                                Jenis Sampah
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">
                                                Total (Kg)
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">
                                                Jumlah Harga (Rp)
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap print:hidden">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRows.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-center py-6"
                                                >
                                                    Tidak ada data sesuai
                                                    filter.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {filteredRows.map(
                                            (row: any, idx: number) => (
                                                <TableRow
                                                    key={`${row.kelasId}-${idx}`}
                                                >
                                                    <TableCell>
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell>{`${row.tingkat}${row.huruf}`}</TableCell>
                                                    <TableCell
                                                        className="max-w-[320px] truncate"
                                                        title={
                                                            row.jenisList || '-'
                                                        }
                                                    >
                                                        {row.jenisList || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {Number(
                                                            row.total || 0,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                            {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        Rp{' '}
                                                        {Number(
                                                            row.totalValue || 0,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                            {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 0,
                                                            },
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="print:hidden">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                title="Edit setoran"
                                                                onClick={() =>
                                                                    openManage({
                                                                        id: row.kelasId,
                                                                        tingkat:
                                                                            row.tingkat,
                                                                        huruf: row.huruf,
                                                                    })
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                title="Reset bulan ini"
                                                                onClick={() => {
                                                                    setSelectedClass(
                                                                        row,
                                                                    );
                                                                    setResetDialogOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                    <tfoot>
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-right font-semibold"
                                            >
                                                Total
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {filteredSumKg.toLocaleString(
                                                    'id-ID',
                                                    {
                                                        maximumFractionDigits: 2,
                                                    },
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                Rp{' '}
                                                {filteredSumValue.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </TableCell>
                                            <TableCell className="print:hidden"></TableCell>
                                        </TableRow>
                                    </tfoot>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1 print:hidden">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Manajemen Jenis Sampah</CardTitle>
                        <div>
                            <Button onClick={() => setJenisModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Jenis Baru
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {localJenis.map((j) => (
                                <div
                                    key={j.id}
                                    className="flex items-center justify-between border rounded p-3"
                                >
                                    <div>
                                        <div className="font-medium">
                                            {j.namaSampah}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Rp{' '}
                                            {Number(
                                                j.hargaPerKg,
                                            ).toLocaleString('id-ID')}
                                            /kg
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingJenis(j);
                                                setNewJenisName(j.namaSampah);
                                                setNewJenisPrice(
                                                    String(j.hargaPerKg),
                                                );
                                                setJenisModalOpen(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => {
                                                setSelectedJenis(j);
                                                setDeleteJenisDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Jenis Sampah */}
            <Dialog
                open={jenisModalOpen}
                onOpenChange={(open) => {
                    setJenisModalOpen(open);
                    if (!open) {
                        setEditingJenis(null);
                        setNewJenisName('');
                        setNewJenisPrice('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingJenis
                                ? 'Edit Jenis Sampah'
                                : 'Tambah Jenis Sampah'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingJenis
                                ? 'Edit nama dan harga per kg.'
                                : 'Tambah jenis sampah baru.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleCreateOrUpdateJenis}
                        className="space-y-4"
                    >
                        <div>
                            <Label>Nama Jenis</Label>
                            <Input
                                value={newJenisName}
                                onChange={(e) =>
                                    setNewJenisName(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Harga / Kg (Rp)</Label>
                            <Input
                                value={newJenisPrice}
                                onChange={(e) =>
                                    setNewJenisPrice(e.target.value)
                                }
                                type="number"
                                step="0.01"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="submit">Simpan</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setJenisModalOpen(false)}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Kelola Setoran per Kelas/Bulan */}
            <Dialog
                open={manageOpen}
                onOpenChange={(open) => {
                    setManageOpen(open);
                    if (!open) {
                        setManageClass(null);
                        setEntries([]);
                        setAddJenisId('');
                        setAddJumlah('');
                        cancelEditEntry();
                    }
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            Kelola Setoran{' '}
                            {manageClass
                                ? `${manageClass.tingkat}${manageClass.huruf}`
                                : ''}{' '}
                            — {MONTHS[selectedMonth - 1]} {selectedYear}
                        </DialogTitle>
                        <DialogDescription>
                            Tambah atau edit setoran untuk kelas ini pada bulan
                            yang dipilih.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Add form */}
                    <form
                        onSubmit={handleAddEntry}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                    >
                        <div className="sm:col-span-2">
                            <Label>Jenis Sampah</Label>
                            <Select
                                value={addJenisId}
                                onValueChange={setAddJenisId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    {localJenis.map((j) => (
                                        <SelectItem
                                            value={String(j.id)}
                                            key={j.id}
                                        >
                                            {j.namaSampah}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Jumlah (Kg)</Label>
                            <Input
                                value={addJumlah}
                                onChange={(e) => setAddJumlah(e.target.value)}
                                type="number"
                                step="0.01"
                            />
                        </div>
                        <div className="sm:col-span-1 flex items-end">
                            <Button type="submit" className="w-full">
                                <Plus className="h-4 w-4 mr-1" /> Tambah
                            </Button>
                        </div>
                    </form>

                    {/* Entries table */}
                    <div className="overflow-x-auto rounded border mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Jumlah (Kg)</TableHead>
                                    <TableHead>Harga/Kg</TableHead>
                                    <TableHead>Total (Rp)</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="w-[120px]">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingEntries && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-6"
                                        >
                                            Memuat...
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loadingEntries && entries.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-6"
                                        >
                                            Belum ada setoran
                                        </TableCell>
                                    </TableRow>
                                )}
                                {entries.map((e) => {
                                    const isEditing = editingEntryId === e.id;
                                    const harga = Number(e.hargaPerKg || 0);
                                    const jumlah = Number(e.jumlahKg || 0);
                                    return (
                                        <TableRow key={e.id}>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Select
                                                        value={editJenisId}
                                                        onValueChange={
                                                            setEditJenisId
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {localJenis.map(
                                                                (j) => (
                                                                    <SelectItem
                                                                        value={String(
                                                                            j.id,
                                                                        )}
                                                                        key={
                                                                            j.id
                                                                        }
                                                                    >
                                                                        {
                                                                            j.namaSampah
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    e.jenisSampah
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        value={editJumlah}
                                                        onChange={(ev) =>
                                                            setEditJumlah(
                                                                ev.target.value,
                                                            )
                                                        }
                                                        type="number"
                                                        step="0.01"
                                                    />
                                                ) : (
                                                    jumlah.toLocaleString(
                                                        'id-ID',
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                Rp{' '}
                                                {harga.toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                Rp{' '}
                                                {(
                                                    harga * jumlah
                                                ).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                {e.createdAt
                                                    ? new Date(
                                                          e.createdAt,
                                                      ).toLocaleDateString(
                                                          'id-ID',
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleSaveEntry(
                                                                        e.id,
                                                                    )
                                                                }
                                                            >
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={
                                                                    cancelEditEntry
                                                                }
                                                            >
                                                                Batal
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    startEditEntry(
                                                                        e,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    setSelectedEntry(
                                                                        e,
                                                                    );
                                                                    setDeleteDialogOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm delete setoran */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setSelectedEntry(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus setoran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedEntry
                                ? `Jenis: ${selectedEntry.jenisSampah} — Jumlah: ${selectedEntry.jumlahKg} kg. Tindakan ini tidak dapat dibatalkan.`
                                : 'Tindakan ini tidak dapat dibatalkan.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!selectedEntry) return;
                                await handleDeleteEntry(selectedEntry.id);
                                setDeleteDialogOpen(false);
                                setSelectedEntry(null);
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm delete jenis sampah */}
            <AlertDialog
                open={deleteJenisDialogOpen}
                onOpenChange={(open) => {
                    setDeleteJenisDialogOpen(open);
                    if (!open) setSelectedJenis(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus jenis sampah?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedJenis
                                ? `Jenis: ${selectedJenis.namaSampah}. Tindakan ini tidak dapat dibatalkan.`
                                : 'Tindakan ini tidak dapat dibatalkan.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!selectedJenis) return;
                                await handleDeleteJenis(selectedJenis.id);
                                setDeleteJenisDialogOpen(false);
                                setSelectedJenis(null);
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm reset setoran */}
            <AlertDialog
                open={resetDialogOpen}
                onOpenChange={(open) => {
                    setResetDialogOpen(open);
                    if (!open) setSelectedClass(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Setoran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedClass
                                ? `Reset semua setoran kelas ${
                                      selectedClass.tingkat
                                  }${selectedClass.huruf} untuk ${
                                      MONTHS[selectedMonth - 1]
                                  } ${selectedYear}?`
                                : 'Tindakan ini tidak dapat dibatalkan.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!selectedClass) return;
                                const res = await resetClassDepositsByMonth(
                                    selectedClass.kelasId,
                                    selectedMonth,
                                    selectedYear,
                                );
                                if ((res as any).success) {
                                    toast({
                                        title: 'Sukses',
                                        description:
                                            'Setoran bulan ini direset',
                                    });
                                    fetchRecap();
                                } else {
                                    toast({
                                        title: 'Error',
                                        description:
                                            (res as any).error || 'Gagal reset',
                                        variant: 'destructive',
                                    });
                                }
                                setResetDialogOpen(false);
                                setSelectedClass(null);
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
