'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import {
    createJenisSampah,
    updateJenisSampah,
    deleteJenisSampah,
} from '../actions';

type JenisSampah = {
    id: number;
    namaSampah: string;
    hargaPerKg: number;
    createdAt: Date;
    updatedAt: Date;
};

interface MasterDataClientProps {
    initialData: JenisSampah[];
}

export default function MasterDataClient({
    initialData,
}: MasterDataClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [jenisSampahList, setJenisSampahList] =
        useState<JenisSampah[]>(initialData);
    const [editing, setEditing] = useState<JenisSampah | null>(null);
    const [formData, setFormData] = useState({
        namaSampah: '',
        hargaPerKg: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                const result = await updateJenisSampah(editing.id, {
                    namaSampah: formData.namaSampah,
                    hargaPerKg: parseFloat(formData.hargaPerKg),
                });
                if (result.success) {
                    toast({
                        title: 'Sukses',
                        description: 'Jenis sampah berhasil diperbarui',
                    });
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await createJenisSampah({
                    namaSampah: formData.namaSampah,
                    hargaPerKg: parseFloat(formData.hargaPerKg),
                });
                if (result.success) {
                    toast({
                        title: 'Sukses',
                        description: 'Jenis sampah berhasil ditambahkan',
                    });
                } else {
                    throw new Error(result.error);
                }
            }
            setFormData({ namaSampah: '', hargaPerKg: '' });
            setEditing(null);
            // Refresh data after successful operation
            router.refresh();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Terjadi kesalahan',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item: JenisSampah) => {
        setEditing(item);
        setFormData({
            namaSampah: item.namaSampah,
            hargaPerKg: item.hargaPerKg.toString(),
        });
    };

    const handleDelete = async (id: number) => {
        try {
            const result = await deleteJenisSampah(id);
            if (result.success) {
                toast({
                    title: 'Sukses',
                    description: 'Jenis sampah berhasil dihapus',
                });
                // Refresh data after successful deletion
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal menghapus jenis sampah',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {editing ? 'Edit' : 'Tambah'} Jenis Sampah
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="namaSampah">Nama Sampah</Label>
                                <Input
                                    id="namaSampah"
                                    value={formData.namaSampah}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            namaSampah: e.target.value,
                                        }))
                                    }
                                    placeholder="Masukkan nama jenis sampah"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hargaPerKg">
                                    Harga per Kg (Rp)
                                </Label>
                                <Input
                                    id="hargaPerKg"
                                    type="number"
                                    step="0.01"
                                    value={formData.hargaPerKg}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            hargaPerKg: e.target.value,
                                        }))
                                    }
                                    placeholder="Masukkan harga per kg"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">
                                {editing ? 'Update' : 'Simpan'}
                            </Button>
                            {editing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditing(null);
                                        setFormData({
                                            namaSampah: '',
                                            hargaPerKg: '',
                                        });
                                    }}
                                >
                                    Batal
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Jenis Sampah</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Sampah</TableHead>
                                    <TableHead>Harga per Kg</TableHead>
                                    <TableHead>Terakhir Diperbarui</TableHead>
                                    <TableHead className="w-[100px]">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jenisSampahList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.namaSampah}</TableCell>
                                        <TableCell>
                                            Rp{' '}
                                            {item.hargaPerKg.toLocaleString(
                                                'id-ID',
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                item.updatedAt,
                                            ).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Hapus Jenis
                                                                Sampah?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini
                                                                tidak dapat
                                                                dibatalkan. Data
                                                                sampah yang
                                                                terkait juga
                                                                akan dihapus.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Batal
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id,
                                                                    )
                                                                }
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}