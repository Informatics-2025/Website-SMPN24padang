'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Printer, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
    createSetoranMasyarakat,
    deleteSetoranMasyarakat,
    getSetoranMasyarakat,
    updateSetoranMasyarakat,
} from '../setoran-masyarakat-actions';
import { MONTHS } from './constants';
import type { JenisSampah } from './types';

type SetoranMasyarakat = {
    id: number;
    namaPenyetor: string;
    jenisSampahId: number;
    jenisSampah: string;
    kategori: string;
    jumlahKg: string | number;
    hargaPerKg: string | number;
    tanggalSetoran: Date | string;
};

const toDateInput = (value: Date | string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export function TabSetoranMasyarakat({ jenisSampah }: { jenisSampah: JenisSampah[] }) {
    const { toast } = useToast();
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [rows, setRows] = useState<SetoranMasyarakat[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        namaPenyetor: '',
        jenisSampahId: '',
        jumlahKg: '',
        tanggalSetoran: toDateInput(today),
    });

    const years = useMemo(
        () => Array.from({ length: 11 }, (_, index) => new Date().getFullYear() - 5 + index),
        [],
    );

    const fetchRows = useCallback(async () => {
        setLoading(true);
        const result = await getSetoranMasyarakat(month, year);
        if (result.data) setRows(result.data as SetoranMasyarakat[]);
        else {
            setRows([]);
            if (result.error) toast({ title: 'Gagal memuat data', description: result.error, variant: 'destructive' });
        }
        setLoading(false);
    }, [month, year, toast]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const resetForm = () => {
        setEditingId(null);
        setForm({
            namaPenyetor: '',
            jenisSampahId: '',
            jumlahKg: '',
            tanggalSetoran: `${year}-${String(month).padStart(2, '0')}-15`,
        });
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const payload = {
            namaPenyetor: form.namaPenyetor,
            jenisSampahId: Number(form.jenisSampahId),
            jumlahKg: Number(form.jumlahKg),
            tanggalSetoran: new Date(`${form.tanggalSetoran}T12:00:00`),
        };
        const result = editingId
            ? await updateSetoranMasyarakat(editingId, payload)
            : await createSetoranMasyarakat(payload);
        if (!result.success) {
            toast({ title: 'Gagal menyimpan', description: result.error || 'Periksa kembali isian.', variant: 'destructive' });
            return;
        }
        toast({ title: 'Berhasil', description: editingId ? 'Setoran diperbarui.' : 'Setoran masyarakat ditambahkan.' });
        resetForm();
        await fetchRows();
    };

    const startEdit = (row: SetoranMasyarakat) => {
        setEditingId(row.id);
        setForm({
            namaPenyetor: row.namaPenyetor,
            jenisSampahId: String(row.jenisSampahId),
            jumlahKg: String(row.jumlahKg),
            tanggalSetoran: toDateInput(row.tanggalSetoran),
        });
    };

    const remove = async (id: number) => {
        if (!window.confirm('Hapus setoran masyarakat ini?')) return;
        const result = await deleteSetoranMasyarakat(id);
        if (!result.success) {
            toast({ title: 'Gagal menghapus', description: result.error, variant: 'destructive' });
            return;
        }
        toast({ title: 'Berhasil', description: 'Setoran dihapus.' });
        await fetchRows();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>{editingId ? 'Edit Setoran Masyarakat' : 'Input Setoran Masyarakat'}</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div><Label>Nama penyetor</Label><Input value={form.namaPenyetor} onChange={(e) => setForm({ ...form, namaPenyetor: e.target.value })} required /></div>
                        <div><Label>Jenis sampah</Label><Select value={form.jenisSampahId} onValueChange={(jenisSampahId) => setForm({ ...form, jenisSampahId })}><SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger><SelectContent>{jenisSampah.map((jenis) => <SelectItem key={jenis.id} value={String(jenis.id)}>{jenis.namaSampah} ({jenis.kategori})</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Jumlah (kg)</Label><Input type="number" min="0.01" step="0.01" value={form.jumlahKg} onChange={(e) => setForm({ ...form, jumlahKg: e.target.value })} required /></div>
                        <div><Label>Tanggal setoran</Label><Input type="date" value={form.tanggalSetoran} onChange={(e) => setForm({ ...form, tanggalSetoran: e.target.value })} required /></div>
                        <div className="flex items-end gap-2"><Button type="submit"><Plus className="mr-1 h-4 w-4" />{editingId ? 'Simpan' : 'Tambah'}</Button>{editingId && <Button type="button" variant="outline" onClick={resetForm}><X className="h-4 w-4" /></Button>}</div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle>Daftar Setoran Masyarakat</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((name, index) => (
                                    <SelectItem key={name} value={String(index + 1)}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((item) => (
                                    <SelectItem key={item} value={String(item)}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={handlePrint} className="print:hidden">
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="hidden print:block mb-4">
                        <h3 className="text-lg font-semibold">Daftar Setoran Masyarakat</h3>
                        <p className="text-sm text-muted-foreground">Bulan {MONTHS[month - 1]} {year}</p>
                    </div>
                    <div className="hidden md:block overflow-x-auto rounded border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Penyetor</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-right">Kg</TableHead>
                                    <TableHead className="text-right">Nilai</TableHead>
                                    <TableHead className="print:hidden">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-6 text-center">Memuat…</TableCell>
                                    </TableRow>
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-6 text-center">Belum ada setoran.</TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{new Date(row.tanggalSetoran).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{row.namaPenyetor}</TableCell>
                                            <TableCell>{row.jenisSampah}</TableCell>
                                            <TableCell className="capitalize">{row.kategori}</TableCell>
                                            <TableCell className="text-right">{Number(row.jumlahKg).toLocaleString('id-ID')}</TableCell>
                                            <TableCell className="text-right">Rp {(Number(row.jumlahKg) * Number(row.hargaPerKg)).toLocaleString('id-ID')}</TableCell>
                                            <TableCell className="print:hidden">
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="outline" onClick={() => startEdit(row)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="destructive" onClick={() => remove(row.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="space-y-4 md:hidden">
                        {loading ? (
                            <div className="rounded-lg border p-4 text-center">Memuat…</div>
                        ) : rows.length === 0 ? (
                            <div className="rounded-lg border p-4 text-center">Belum ada setoran.</div>
                        ) : (
                            rows.map((row) => (
                                <Card key={row.id} className="border">
                                    <CardContent className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold">{row.namaPenyetor}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(row.tanggalSetoran).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <p className="text-sm font-semibold">Rp {(Number(row.jumlahKg) * Number(row.hargaPerKg)).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="grid gap-2 text-sm">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">Jenis</span>
                                                <span>{row.jenisSampah}</span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">Kategori</span>
                                                <span className="capitalize">{row.kategori}</span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">Kg</span>
                                                <span>{Number(row.jumlahKg).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="flex-1" size="sm" variant="outline" onClick={() => startEdit(row)}>
                                                Edit
                                            </Button>
                                            <Button className="flex-1" size="sm" variant="destructive" onClick={() => remove(row.id)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
