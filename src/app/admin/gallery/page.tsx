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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { galleryItems as GalleryItemSchema } from "@/lib/db/schema";
import type { FormActionState } from "@/types/action-state";
import { type InferSelectModel } from "drizzle-orm";
import { Pencil, PlusCircle, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItems,
  updateGalleryItem,
} from "./actions";

type GalleryItem = InferSelectModel<typeof GalleryItemSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

function GalleryForm({
  action,
  onClose,
}: {
  action: (
    state: FormActionState,
    formData: FormData,
  ) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(action, {
    success: false,
    message: "",
  });
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);

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
        <Label htmlFor="image">Gambar</Label>
        <div className="mt-1 flex items-center gap-4">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={120}
              height={80}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="flex h-20 w-32 items-center justify-center rounded-md bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <Input
            id="image"
            name="image"
            type="file"
            required
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="alt">Judul/Deskripsi Gambar</Label>
        <Input id="alt" name="alt" required />
      </div>
      <div>
        <Label htmlFor="category">Kategori</Label>
        <Input id="category" name="category" required />
      </div>
      <div>
        <Label htmlFor="orientation">Orientasi Gambar</Label>
        <Select name="orientation" defaultValue="landscape" required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih orientasi..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">Landscape</SelectItem>
            <SelectItem value="portrait">Portrait</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}

function GalleryEditForm({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(updateGalleryItem, {
    success: false,
    message: "",
  });
  const { toast } = useToast();

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

  return (
    <form action={formAction} className="space-y-4">
      <Input type="hidden" name="id" value={item.id} />
      <div className="flex items-center gap-4">
        <Image
          src={item.src}
          alt={item.alt}
          width={120}
          height={80}
          className="rounded-md object-cover"
        />
        <div>
          <p className="text-sm font-medium">Gambar saat ini</p>
          <p className="text-xs text-muted-foreground">
            Mengubah gambar tidak didukung saat ini.
          </p>
        </div>
      </div>
      <div>
        <Label htmlFor="alt">Judul/Deskripsi Gambar</Label>
        <Input id="alt" name="alt" defaultValue={item.alt} required />
      </div>
      <div>
        <Label htmlFor="category">Kategori</Label>
        <Input
          id="category"
          name="category"
          defaultValue={item.category}
          required
        />
      </div>
      <div>
        <Label htmlFor="orientation">Orientasi Gambar</Label>
        <Select name="orientation" defaultValue={item.orientation} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih orientasi..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">Landscape</SelectItem>
            <SelectItem value="portrait">Portrait</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}

export default function GalleryAdminPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const fetchItems = async () => {
    setIsLoading(true);
    const items = await getGalleryItems();
    setGalleryItems(items);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    startTransition(async () => {
      const result = await deleteGalleryItem(selectedItem.id, selectedItem.src);
      if (result.success) {
        toast({ title: "Sukses!", description: result.message });
        setGalleryItems(
          galleryItems.filter((item) => item.id !== selectedItem.id),
        );
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
        });
      }
      setDeleteOpen(false);
      setSelectedItem(null);
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Kelola Galeri</CardTitle>
            <CardDescription className="mt-2 text-lg">
              Tambah, edit, atau hapus gambar dari galeri sekolah.
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Gambar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Gambar Baru</DialogTitle>
                <DialogDescription>
                  Isi detail di bawah ini untuk menambahkan gambar baru.
                </DialogDescription>
              </DialogHeader>
              <GalleryForm
                action={createGalleryItem}
                onClose={() => {
                  setAddOpen(false);
                  fetchItems();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {galleryItems.map((item) => (
              <div key={item.id} className="group relative">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={400}
                  height={400}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedItem(item);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="h-5 w-5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setSelectedItem(item);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Hapus Gambar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      {selectedItem && (
        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Detail Gambar</DialogTitle>
            </DialogHeader>
            <GalleryEditForm
              item={selectedItem}
              onClose={() => {
                setEditOpen(false);
                setSelectedItem(null);
                fetchItems();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus gambar
              dari galeri secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
