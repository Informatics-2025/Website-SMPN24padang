"use client";

import {
  createStaff,
  deleteStaff,
  getStaff,
  updateStaff,
} from "@/app/admin/staff/actions";
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
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { staff as StaffSchema } from "@/lib/db/schema";
import type { FormActionState } from "@/types/action-state";
import { type InferSelectModel } from "drizzle-orm";
import {
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";

type Staff = InferSelectModel<typeof StaffSchema>;

function SubmitButton({
  pendingText = "Menyimpan...",
}: {
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : "Simpan"}
    </Button>
  );
}

function StaffForm({
  action,
  initialData,
  onClose,
}: {
  action: (
    state: FormActionState,
    formData: FormData,
  ) => Promise<{ success: boolean; message: string }>;
  initialData?: Staff | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(action, {
    success: false,
    message: "",
  });
  const { toast } = useToast();
  const [preview, setPreview] = useState(initialData?.imageUrl || null);

  useEffect(() => {
    if (state.success) {
      toast({ title: "Sukses!", description: state.message });
      onClose();
    } else if (state.message && !state.success) {
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
        <Label>Foto</Label>
        <div className="mt-1 flex items-center gap-4">
          <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-muted">
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                width={80}
                height={80}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
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
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          required
        />
      </div>
      <div>
        <Label htmlFor="position">Jabatan</Label>
        <Select name="position" defaultValue={initialData?.position} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih jabatan..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kepala Sekolah">Kepala Sekolah</SelectItem>
            <SelectItem value="Wakil Kurikulum">Wakil Kurikulum</SelectItem>
            <SelectItem value="Wakil Kesiswaan">Wakil Kesiswaan</SelectItem>
            <SelectItem value="Koordinator Tata Usaha">
              Koordinator Tata Usaha
            </SelectItem>
            <SelectItem value="Wakil Sarana & Prasarana">
              Wakil Sarana & Prasarana
            </SelectItem>
            <SelectItem value="Guru Mata Pelajaran">
              Guru Mata Pelajaran
            </SelectItem>
            <SelectItem value="Guru Bimbingan Konseling">
              Guru Bimbingan Konseling
            </SelectItem>
            <SelectItem value="Staf Tata Usaha">Staf Tata Usaha</SelectItem>
            <SelectItem value="Pustakawan">Pustakawan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="subject">Mata Pelajaran / Bidang</Label>
        <Input
          id="subject"
          name="subject"
          defaultValue={initialData?.subject || ""}
        />
      </div>
      <div>
        <Label htmlFor="homeroomOf">Wali Kelas (Opsional)</Label>
        <Input
          id="homeroomOf"
          name="homeroomOf"
          placeholder="Contoh: Kelas 9A"
          defaultValue={initialData?.homeroomOf || ""}
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

export default function StaffClientPage({
  initialStaff,
}: {
  initialStaff: Staff[];
}) {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [dialog, setDialog] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const refreshData = async () => {
    const staffData = await getStaff();
    setStaff(staffData);
  };

  const handleCloseDialog = (refresh = false) => {
    setDialog(null);
    setSelectedStaff(null);
    if (refresh) refreshData();
  };

  const handleDelete = () => {
    if (!selectedStaff) return;
    startTransition(async () => {
      const result = await deleteStaff(
        selectedStaff.id,
        selectedStaff.imageUrl,
      );
      if (result.success) {
        toast({ title: "Sukses!", description: result.message });
        handleCloseDialog(true);
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const boundUpdateStaff = selectedStaff
    ? updateStaff.bind(null, selectedStaff.id, selectedStaff.imageUrl)
    : () => Promise.resolve({ success: false, message: "No staff selected" });

  const positions = [
    "all",
    ...new Set(staff.map((s) => s.position).filter((p): p is string => !!p)),
  ];

  const filteredStaff = staff.filter((s) => {
    const nameMatch = (s.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const positionMatch =
      positionFilter === "all" || s.position === positionFilter;
    return nameMatch && positionMatch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-xl font-bold sm:text-2xl">
              Kelola Guru & Staf
            </CardTitle>
            <CardDescription className="mt-1 text-sm sm:mt-2 sm:text-base">
              Tambah, edit, atau hapus data.
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialog("add")}
            className="w-full shrink-0 sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Staf
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Input
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => startTransition(() => setSearch(e.target.value))}
            className="w-full sm:max-w-xs"
          />
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full sm:max-w-xs">
              <SelectValue placeholder="Filter jabatan" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p === "all" ? "Semua Jabatan" : p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">Foto</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Wali Kelas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-md:mb-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted md:h-10 md:w-10">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {item.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    mobileLabel="Nama"
                    className="text-base font-semibold leading-snug md:text-sm md:font-medium"
                  >
                    <span className="break-words">{item.name}</span>
                  </TableCell>
                  <TableCell mobileLabel="Jabatan">
                    <span className="break-words text-muted-foreground">
                      {item.position}
                    </span>
                  </TableCell>
                  <TableCell mobileLabel="Wali Kelas">
                    {item.homeroomOf ? (
                      <Badge variant="secondary" className="whitespace-normal">
                        {item.homeroomOf}
                      </Badge>
                    ) : (
                      "-"
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
                          onClick={() => {
                            setSelectedStaff(item);
                            setDialog("edit");
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => {
                            setSelectedStaff(item);
                            setDialog("delete");
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
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
                  className="h-24 text-center max-md:block max-md:h-auto max-md:py-6"
                >
                  Belum ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Dialogs */}
      <Dialog
        open={dialog === "add" || dialog === "edit"}
        onOpenChange={() => handleCloseDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "add" ? "Tambah Staf Baru" : "Edit Data Staf"}
            </DialogTitle>
          </DialogHeader>
          <StaffForm
            action={dialog === "add" ? createStaff : boundUpdateStaff}
            initialData={dialog === "edit" ? selectedStaff : null}
            onClose={() => handleCloseDialog(true)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={dialog === "delete"}
        onOpenChange={() => handleCloseDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data secara permanen dan tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
