"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CardMobileOnly,
  MobileDataCard,
  MobileDataCardHeader,
  MobileDataCardRow,
  MobileDataCardTable,
  MobileEmptyCard,
  TableDesktopOnly,
} from "@/components/admin/mobile-data-cards";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { WasteNewsItem } from "@/types/banksampah";
import {
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import {
  createWasteNews,
  deleteWasteNews,
  getWasteNews,
  updateWasteNews,
} from "../actions";
import type { WasteFormAction, WasteFormState } from "./form-types";
import { SubmitButton } from "./submit-button";

function WasteNewsForm({
  action,
  initialData,
  onClose,
}: {
  action: WasteFormAction;
  initialData?: WasteNewsItem | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState<WasteFormState, FormData>(action, {
    success: false,
    message: "",
  });
  const { toast } = useToast();
  const [preview, setPreview] = useState(initialData?.previewUrl || null);

  useEffect(() => {
    if (state.success) {
      toast({ title: "Sukses!", description: state.message });
      onClose();
    } else if (state.message) {
      toast({
        title: "Gagal",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
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
        <Label htmlFor="googleDriveUrl">Google Drive URL (Opsional)</Label>
        <Input
          id="googleDriveUrl"
          name="googleDriveUrl"
          defaultValue={initialData?.googleDriveUrl || ""}
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

export default function WasteNewsTab() {
  const [news, setNews] = useState<WasteNewsItem[]>([]);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<WasteNewsItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = () =>
    getWasteNews().then((data: WasteNewsItem[]) => setNews(data));

  useEffect(() => {
    refresh();
  }, []);

  const { toast } = useToast();

  const handleDelete = () => {
    if (!selectedNews) return;
    startTransition(async () => {
      const result = await deleteWasteNews(selectedNews.id);
      if (result.success) {
        toast({ title: "Sukses!", description: result.message });
        setNews(news.filter((item) => item.id !== selectedNews.id));
        setDeleteOpen(false);
        setSelectedNews(null);
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
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
      <div className="mb-4 flex justify-stretch sm:justify-end">
        <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
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
                refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {/* Tampilan Desktop: Tabel Standar */}
      <TableDesktopOnly className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Gambar</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Google Drive</TableHead>
              <TableHead className="w-[70px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length > 0 ? (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.previewUrl || "https://placehold.co/80x80.png"}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="h-16 w-16 rounded-md object-cover md:h-16 md:w-16"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="break-words">{item.title}</span>
                  </TableCell>
                  <TableCell>
                    <span className="break-words text-muted-foreground line-clamp-3">
                      {item.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.googleDriveUrl ? (
                      <a
                        href={item.googleDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-medium text-primary hover:underline"
                      >
                        Buka Link
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Belum ada data edukasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableDesktopOnly>

      {/* Tampilan Mobile: Kartu Berstruktur Tabel */}
      <CardMobileOnly>
        {news.length > 0 ? (
          news.map((item) => (
            <MobileDataCard key={item.id}>
              <MobileDataCardHeader
                media={
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted overflow-hidden">
                    <Image
                      src={item.previewUrl || "https://placehold.co/80x80.png"}
                      alt={item.title}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                }
                title={item.title}
                action={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
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
                }
              />
              <MobileDataCardTable>
                <MobileDataCardRow label="Deskripsi">
                  <p className="line-clamp-4 leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </MobileDataCardRow>
                <MobileDataCardRow label="Google Drive">
                  {item.googleDriveUrl ? (
                    <a
                      href={item.googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all"
                    >
                      Buka Link Drive
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </MobileDataCardRow>
              </MobileDataCardTable>
            </MobileDataCard>
          ))
        ) : (
          <MobileEmptyCard message="Belum ada data edukasi." />
        )}
      </CardMobileOnly>

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
                refresh();
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data
              berita secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedNews(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
