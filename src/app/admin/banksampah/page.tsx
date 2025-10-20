'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// TODO: Implement WasteNews and WasteDocumentation components

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
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    MoreHorizontal,
    Pencil,
    PlusCircle,
    Trash2,
    Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import {
    createWasteDocumentation,
    createWasteNews,
    deleteWasteDocumentation,
    deleteWasteNews,
    getWasteDocumentation,
    getWasteNews,
    updateWasteDocumentation,
    updateWasteNews,
    getWasteVideos,
    createWasteVideo,
    updateWasteVideo,
    deleteWasteVideo,
} from './actions';

// Define the type for a single news item
export type WasteNewsItem = {
    id: number;
    title: string;
    description: string;
    previewUrl: string;
    googleDriveUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};

export type WasteVideoItem = {
    id: number;
    title: string;
    youtubeUrl: string;
    createdAt: Date | null;
    updatedAt: Date | null;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan'}
        </Button>
    );
}

function WasteVideoForm({
    action,
    initialData,
    onClose,
}: {
    action: (
        state: { success: boolean; message: string },
        formData: FormData,
    ) => Promise<{ success: boolean; message: string }>;
    initialData?: WasteVideoItem | null;
    onClose: () => void;
}) {
    const [state, formAction] = useFormState(action, {
        success: false,
        message: '',
    });
    const { toast } = useToast();

    useEffect(() => {
        if (state.success) {
            toast({ title: 'Sukses!', description: state.message });
            onClose();
        } else if (state.message) {
            toast({
                title: 'Gagal',
                description: state.message,
                variant: 'destructive',
            });
        }
    }, [state, toast, onClose]);

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <Label htmlFor="title">Judul Video</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={initialData?.title}
                    required
                />
            </div>
            <div>
                <Label htmlFor="youtubeUrl">Youtube URL</Label>
                <Input
                    id="youtubeUrl"
                    name="youtubeUrl"
                    defaultValue={initialData?.youtubeUrl || ''}
                    required
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <SubmitButton />
            </DialogFooter>
        </form>
    );
}

function WasteVideos() {
    const [videos, setVideos] = useState<WasteVideoItem[]>([]);
    const [isAddOpen, setAddOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] =
        useState<WasteVideoItem | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getWasteVideos().then((data: WasteVideoItem[]) =>
            setVideos(data),
        );
    }, []);

    const { toast } = useToast();

    const handleDelete = () => {
        if (!selectedVideo) return;
        startTransition(async () => {
            const result = await deleteWasteVideo(selectedVideo.id);
            if (result.success) {
                toast({ title: 'Sukses!', description: result.message });
                setVideos(videos.filter((item) => item.id !== selectedVideo.id));
                setDeleteOpen(false);
                setSelectedVideo(null);
            } else {
                toast({
                    title: 'Gagal',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
    };

    const boundUpdateWasteVideo = updateWasteVideo.bind(
        null,
        selectedVideo?.id || 0,
    );

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Video
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Video Baru</DialogTitle>
                        </DialogHeader>
                        <WasteVideoForm
                            action={createWasteVideo}
                            onClose={() => {
                                setAddOpen(false);
                                getWasteVideos().then(
                                    (data: WasteVideoItem[]) =>
                                        setVideos(data),
                                );
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Judul</TableHead>
                            <TableHead>Youtube URL</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {videos.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.title}
                                </TableCell>
                                <TableCell>{item.youtubeUrl}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setSelectedVideo(item);
                                                    setEditOpen(true);
                                                }}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setSelectedVideo(item);
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

            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Video</DialogTitle>
                    </DialogHeader>
                    {selectedVideo && (
                        <WasteVideoForm
                            action={boundUpdateWasteVideo}
                            initialData={selectedVideo}
                            onClose={() => {
                                setEditOpen(false);
                                setSelectedVideo(null);
                                getWasteVideos().then(
                                    (data: WasteVideoItem[]) =>
                                        setVideos(data),
                                );
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan
                            menghapus data video secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedVideo(null)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function WasteNewsForm({
    action,
    initialData,
    onClose,
}: {
    action: (
        state: { success: boolean; message: string },
        formData: FormData,
    ) => Promise<{ success: boolean; message: string }>;
    initialData?: WasteNewsItem | null;
    onClose: () => void;
}) {
    const [state, formAction] = useFormState(action, {
        success: false,
        message: '',
    });
    const { toast } = useToast();
    const [preview, setPreview] = useState(initialData?.previewUrl || null);

    useEffect(() => {
        if (state.success) {
            toast({ title: 'Sukses!', description: state.message });
            onClose();
        } else if (state.message) {
            toast({
                title: 'Gagal',
                description: state.message,
                variant: 'destructive',
            });
        }
    }, [state, toast, onClose]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <Label>Gambar</Label>
                <div className="mt-1 flex items-center gap-4">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                    <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="max-w-xs"
                        required={!initialData}
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="title">Judul Berita</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={initialData?.title}
                    required
                />
            </div>
            <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={initialData?.description}
                    required
                />
            </div>
            <div>
                <Label htmlFor="googleDriveUrl">
                    Google Drive URL (Opsional)
                </Label>
                <Input
                    id="googleDriveUrl"
                    name="googleDriveUrl"
                    defaultValue={initialData?.googleDriveUrl || ''}
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <SubmitButton />
            </DialogFooter>
        </form>
    );
}

function WasteNews() {
    const [news, setNews] = useState<WasteNewsItem[]>([]);
    const [isAddOpen, setAddOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<WasteNewsItem | null>(
        null,
    );
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getWasteNews().then((data: WasteNewsItem[]) => setNews(data));
    }, []);

    const { toast } = useToast();

    const handleDelete = () => {
        if (!selectedNews) return;
        startTransition(async () => {
            const result = await deleteWasteNews(selectedNews.id);
            if (result.success) {
                toast({ title: 'Sukses!', description: result.message });
                setNews(news.filter((item) => item.id !== selectedNews.id));
                setDeleteOpen(false);
                setSelectedNews(null);
            } else {
                toast({
                    title: 'Gagal',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
    };

    const boundUpdateWasteNews = updateWasteNews.bind(
        null,
        selectedNews?.id || 0,
    );

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Edukasi
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Edukasi Baru</DialogTitle>
                        </DialogHeader>
                        <WasteNewsForm
                            action={createWasteNews}
                            onClose={() => {
                                setAddOpen(false);
                                getWasteNews().then((data: WasteNewsItem[]) =>
                                    setNews(data),
                                );
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gambar</TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Google Drive</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {news.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Image
                                        src={
                                            item.previewUrl ||
                                            'https://placehold.co/80x80.png'
                                        }
                                        alt={item.title}
                                        width={80}
                                        height={80}
                                        className="rounded-md object-cover"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item.title}
                                </TableCell>
                                <TableCell>
                                    {item.googleDriveUrl ? (
                                        <a
                                            href={item.googleDriveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Link
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setSelectedNews(item);
                                                    setEditOpen(true);
                                                }}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setSelectedNews(item);
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

            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Berita</DialogTitle>
                    </DialogHeader>
                    {selectedNews && (
                        <WasteNewsForm
                            action={boundUpdateWasteNews}
                            initialData={selectedNews}
                            onClose={() => {
                                setEditOpen(false);
                                setSelectedNews(null);
                                getWasteNews().then((data: WasteNewsItem[]) =>
                                    setNews(data),
                                );
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan
                            menghapus data berita secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setSelectedNews(null)}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function WasteDocumentation() {
    const [docs, setDocs] = useState<WasteDocumentationItem[]>([]);
    const [isAddOpen, setAddOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] =
        useState<WasteDocumentationItem | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getWasteDocumentation().then((data: WasteDocumentationItem[]) =>
            setDocs(data),
        );
    }, []);

    const { toast } = useToast();

    const handleDelete = () => {
        if (!selectedDoc) return;
        startTransition(async () => {
            const result = await deleteWasteDocumentation(selectedDoc.id);
            if (result.success) {
                toast({ title: 'Sukses!', description: result.message });
                setDocs(docs.filter((item) => item.id !== selectedDoc.id));
                setDeleteOpen(false);
                setSelectedDoc(null);
            } else {
                toast({
                    title: 'Gagal',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
    };

    const boundUpdateWasteDocumentation = updateWasteDocumentation.bind(
        null,
        selectedDoc?.id || 0,
    );

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Dokumentasi
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Dokumentasi Baru</DialogTitle>
                            <DialogDescription>
                                Pilih salah satu: unggah gambar atau masukkan
                                link YouTube. Jika keduanya diisi, link YouTube
                                akan diprioritaskan.
                            </DialogDescription>
                        </DialogHeader>
                        <WasteDocumentationForm
                            action={createWasteDocumentation}
                            onClose={() => {
                                setAddOpen(false);
                                getWasteDocumentation().then(
                                    (data: WasteDocumentationItem[]) =>
                                        setDocs(data),
                                );
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gambar</TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Youtube URL</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {docs.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Image
                                        src={
                                            item.imageUrl ||
                                            'https://placehold.co/80x80.png'
                                        }
                                        alt={item.title}
                                        width={80}
                                        height={80}
                                        className="rounded-md object-cover"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item.title}
                                </TableCell>
                                <TableCell>{item.youtubeUrl}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
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

            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Dokumentasi</DialogTitle>
                        <DialogDescription>
                            Pilih salah satu: unggah gambar atau masukkan link
                            YouTube. Jika keduanya diisi, link YouTube akan
                            diprioritaskan.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDoc && (
                        <WasteDocumentationForm
                            action={boundUpdateWasteDocumentation}
                            initialData={selectedDoc}
                            onClose={() => {
                                setEditOpen(false);
                                setSelectedDoc(null);
                                getWasteDocumentation().then(
                                    (data: WasteDocumentationItem[]) =>
                                        setDocs(data),
                                );
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan
                            menghapus data dokumentasi secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedDoc(null)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function WasteDocumentationForm({
    action,
    initialData,
    onClose,
}: {
    action: (
        state: { success: boolean; message: string },
        formData: FormData,
    ) => Promise<{ success: boolean; message: string }>;
    initialData?: WasteDocumentationItem | null;
    onClose: () => void;
}) {
    const [state, formAction] = useFormState(action, {
        success: false,
        message: '',
    });
    const { toast } = useToast();
    const [preview, setPreview] = useState(initialData?.imageUrl || null);

    useEffect(() => {
        if (state.success) {
            toast({ title: 'Sukses!', description: state.message });
            onClose();
        } else if (state.message) {
            toast({
                title: 'Gagal',
                description: state.message,
                variant: 'destructive',
            });
        }
    }, [state, toast, onClose]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <Label>Gambar</Label>
                <div className="mt-1 flex items-center gap-4">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                    <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="max-w-xs"
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="title">Judul Dokumentasi</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={initialData?.title}
                    required
                />
            </div>
            <div>
                <Label htmlFor="youtubeUrl">Youtube URL (Opsional)</Label>
                <Input
                    id="youtubeUrl"
                    name="youtubeUrl"
                    defaultValue={initialData?.youtubeUrl || ''}
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <SubmitButton />
            </DialogFooter>
        </form>
    );
}

export type WasteDocumentationItem = {
    id: number;
    title: string;
    imageUrl: string | null;
    youtubeUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};

export default function BankSampahAdminPage() {
    return (
        <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted p-0 border-b">
                <TabsTrigger
                    value="news"
                    className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
                >
                    Edukasi Sispendig
                </TabsTrigger>
                <TabsTrigger
                    value="videos"
                    className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
                >
                    Video Edukasi
                </TabsTrigger>
                <TabsTrigger
                    value="documentation"
                    className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none"
                >
                    Dokumentasi Sispendig
                </TabsTrigger>
            </TabsList>
            <TabsContent value="news">
                <Card>
                    <CardHeader>
                        <CardTitle>Kelola Edukasi Sispendig</CardTitle>
                        <CardDescription>
                            Tambah, edit, atau hapus berita seputar bank sampah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WasteNews />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="videos">
                <Card>
                    <CardHeader>
                        <CardTitle>Kelola Video Edukasi</CardTitle>
                        <CardDescription>
                            Tambah, edit, atau hapus video edukasi seputar bank
                            sampah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent><WasteVideos /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="documentation">
                <Card>
                    <CardHeader>
                        <CardTitle>Kelola Dokumentasi Bank Sampah</CardTitle>
                        <CardDescription>
                            Tambah, edit, atau hapus dokumentasi kegiatan bank
                            sampah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WasteDocumentation />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
