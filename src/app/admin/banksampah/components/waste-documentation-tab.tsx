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
  DialogDescription,
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
import { useToast } from "@/hooks/use-toast";
import type { WasteDocumentationItem } from "@/types/banksampah";
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
  createWasteDocumentation,
  deleteWasteDocumentation,
  getWasteDocumentation,
  updateWasteDocumentation,
} from "../actions";
import type { WasteFormAction, WasteFormState } from "./form-types";
import { SubmitButton } from "./submit-button";

function WasteDocumentationForm({
  action,
  initialData,
  onClose,
}: {
  action: WasteFormAction;
  initialData?: WasteDocumentationItem | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState<WasteFormState, FormData>(action, {
    success: false,
    message: "",
  });
  const { toast } = useToast();
  const [preview, setPreview] = useState(initialData?.imageUrl || null);

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
          defaultValue={initialData?.youtubeUrl || ""}
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

const FORM_HINT =
  "Pilih salah satu: unggah gambar atau masukkan link YouTube. Jika keduanya diisi, link YouTube akan diprioritaskan.";

export default function WasteDocumentationTab() {
  const [docs, setDocs] = useState<WasteDocumentationItem[]>([]);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<WasteDocumentationItem | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const refresh = () =>
    getWasteDocumentation().then((data: WasteDocumentationItem[]) =>
      setDocs(data),
    );

  useEffect(() => {
    refresh();
  }, []);

  const { toast } = useToast();

  const handleDelete = () => {
    if (!selectedDoc) return;
    startTransition(async () => {
      const result = await deleteWasteDocumentation(selectedDoc.id);
      if (result.success) {
        toast({ title: "Sukses!", description: result.message });
        setDocs(docs.filter((item) => item.id !== selectedDoc.id));
        setDeleteOpen(false);
        setSelectedDoc(null);
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
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
      <div className="mb-4 flex justify-stretch sm:justify-end">
        <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Dokumentasi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Dokumentasi Baru</DialogTitle>
              <DialogDescription>{FORM_HINT}</DialogDescription>
            </DialogHeader>
            <WasteDocumentationForm
              action={createWasteDocumentation}
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
              <TableHead>Youtube URL</TableHead>
              <TableHead className="w-[70px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length > 0 ? (
              docs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.imageUrl || "https://placehold.co/80x80.png"}
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
                    {item.youtubeUrl ? (
                      <a
                        href={item.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-medium text-primary hover:underline"
                      >
                        {item.youtubeUrl}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Belum ada data dokumentasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableDesktopOnly>

      {/* Tampilan Mobile: Kartu Berstruktur Tabel */}
      <CardMobileOnly>
        {docs.length > 0 ? (
          docs.map((item) => (
            <MobileDataCard key={item.id}>
              <MobileDataCardHeader
                media={
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted overflow-hidden">
                    <Image
                      src={item.imageUrl || "https://placehold.co/80x80.png"}
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
                }
              />
              <MobileDataCardTable>
                <MobileDataCardRow label="Tipe Media">
                  <span className="font-medium text-foreground">
                    {item.imageUrl && item.youtubeUrl
                      ? "Foto & Video"
                      : item.youtubeUrl
                      ? "Video YouTube"
                      : "Foto Dokumentasi"}
                  </span>
                </MobileDataCardRow>
                <MobileDataCardRow label="YouTube URL">
                  {item.youtubeUrl ? (
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all"
                    >
                      <span className="line-clamp-2">{item.youtubeUrl}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </MobileDataCardRow>
              </MobileDataCardTable>
            </MobileDataCard>
          ))
        ) : (
          <MobileEmptyCard message="Belum ada data dokumentasi." />
        )}
      </CardMobileOnly>

      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dokumentasi</DialogTitle>
            <DialogDescription>{FORM_HINT}</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <WasteDocumentationForm
              action={boundUpdateWasteDocumentation}
              initialData={selectedDoc}
              onClose={() => {
                setEditOpen(false);
                setSelectedDoc(null);
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
              dokumentasi secara permanen.
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
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
