'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    PlusCircle,
    MoreHorizontal,
    Trash2,
    Pencil,
    LinkIcon,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
    createAccreditation,
    updateAccreditation,
    deleteAccreditation,
} from './actions';
import { getAccreditationsAction } from './actions';
import { type accreditations as AccreditationDoc } from '@/lib/db/schema';

export default function AccreditationAdminPage() {
    console.log('AccreditationAdminPage rendered'); // Log 1

    const [documents, setDocuments] = useState<
        (typeof AccreditationDoc.$inferSelect)[]
    >([]);
    const [isAddOpen, setAddOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<
        typeof AccreditationDoc.$inferSelect | null
    >(null);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        console.log('useEffect in AccreditationAdminPage triggered'); // Log 2
        fetchAccreditations();
    }, []);

    const fetchAccreditations = async () => {
        console.log('Fetching accreditations...'); // Log 3
        try {
            const data = await getAccreditationsAction();
            console.log('Accreditations fetched:', data); // Log 4
            setDocuments(data);
            console.log('Documents state updated.'); // Log 5
        } catch (error) {
            console.error('Error during fetchAccreditations:', error); // Log 6
        }
    };

    const handleAddDoc = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            link: formData.get('link') as string,
        };
        startTransition(async () => {
            const result = await createAccreditation(data);
            if (result.success) {
                toast({ title: 'Sukses!', description: result.message });
                fetchAccreditations();
                setAddOpen(false);
            } else {
                toast({
                    title: 'Gagal!',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
    };

    const handleEditDoc = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedDoc) return;

        const formData = new FormData(event.currentTarget);
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            link: formData.get('link') as string,
        };

        startTransition(async () => {
            const result = await updateAccreditation(selectedDoc.id, data);
            if (result.success) {
                toast({ title: 'Sukses!', description: result.message });
                fetchAccreditations();
                setEditOpen(false);
                setSelectedDoc(null);
            } else {
                toast({
                    title: 'Gagal!',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
    };

    const handleDeleteConfirm = () => {
        if (!selectedDoc) return;
        startTransition(async () => {
            const result = await deleteAccreditation(selectedDoc.id);
            if (result.success) {
                toast({ title: 'Sukses!', description: result.message });
                fetchAccreditations();
                setDeleteOpen(false);
                setSelectedDoc(null);
            } else {
                toast({
                    title: 'Gagal!',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">
                            Kelola Sertifikasi Akreditasi
                        </CardTitle>
                        <CardDescription className="mt-2 text-lg">
                            Tambah, edit, atau hapus dokumen sertifikasi &
                            penghargaan.
                        </CardDescription>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Dokumen
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Tambah Dokumen Baru</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddDoc} className="space-y-4">
                                <div>
                                    <Label htmlFor="title-add">
                                        Judul Dokumen
                                    </Label>
                                    <Input
                                        id="title-add"
                                        name="title"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description-add">
                                        Deskripsi Singkat
                                    </Label>
                                    <Textarea
                                        id="description-add"
                                        name="description"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="link-add">
                                        Tautan Google Drive
                                    </Label>
                                    <Input
                                        id="link-add"
                                        name="link"
                                        type="url"
                                        placeholder="https://drive.google.com/.../view"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">Judul</TableHead>
                                <TableHead>Tautan</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-base">
                                        {item.title}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={item.link}
                                            target="_blank"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                            Buka Tautan
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <span className="sr-only">
                                                        Buka menu
                                                    </span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onSelect={() => {
                                                        setSelectedDoc(item);
                                                        setEditOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() => {
                                                        setSelectedDoc(item);
                                                        setDeleteOpen(true);
                                                    }}
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Hapus</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {/* Edit Dialog and Delete AlertDialog remain the same */}
            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Dokumen</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditDoc} className="space-y-4">
                        <div>
                            <Label htmlFor="title-edit">Judul Dokumen</Label>
                            <Input
                                id="title-edit"
                                name="title"
                                defaultValue={selectedDoc?.title}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description-edit">
                                Deskripsi Singkat
                            </Label>
                            <Textarea
                                id="description-edit"
                                name="description"
                                defaultValue={selectedDoc?.description}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="link-edit">
                                Tautan Google Drive
                            </Label>
                            <Input
                                id="link-edit"
                                name="link"
                                type="url"
                                defaultValue={selectedDoc?.link}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan
                            menghapus data dokumen secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedDoc(null)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}