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
import { useToast } from "@/hooks/use-toast";
import type { WasteVideoItem } from "@/types/banksampah";
import {
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
  Youtube,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import {
  createWasteVideo,
  deleteWasteVideo,
  getWasteVideos,
  updateWasteVideo,
} from "../actions";
import type { WasteFormAction, WasteFormState } from "./form-types";
import { SubmitButton } from "./submit-button";

function WasteVideoForm({
  action,
  initialData,
  onClose,
}: {
  action: WasteFormAction;
  initialData?: WasteVideoItem | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState<WasteFormState, FormData>(action, {
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
          defaultValue={initialData?.youtubeUrl || ""}
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

export default function WasteVideosTab() {
  const [videos, setVideos] = useState<WasteVideoItem[]>([]);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WasteVideoItem | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const refresh = () =>
    getWasteVideos().then((data: WasteVideoItem[]) => setVideos(data));

  useEffect(() => {
    refresh();
  }, []);

  const { toast } = useToast();

  const handleDelete = () => {
    if (!selectedVideo) return;
    startTransition(async () => {
      const result = await deleteWasteVideo(selectedVideo.id);
      if (result.success) {
        toast({ title: "Sukses!", description: result.message });
        setVideos(videos.filter((item) => item.id !== selectedVideo.id));
        setDeleteOpen(false);
        setSelectedVideo(null);
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
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
      <div className="mb-4 flex justify-stretch sm:justify-end">
        <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
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
              <TableHead>Judul</TableHead>
              <TableHead>Youtube URL</TableHead>
              <TableHead className="w-[70px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length > 0 ? (
              videos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <span className="break-words">{item.title}</span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-medium text-primary hover:underline"
                    >
                      {item.youtubeUrl}
                    </a>
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  Belum ada data video.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableDesktopOnly>

      {/* Tampilan Mobile: Kartu Berstruktur Tabel */}
      <CardMobileOnly>
        {videos.length > 0 ? (
          videos.map((item) => (
            <MobileDataCard key={item.id}>
              <MobileDataCardHeader
                media={
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600 border border-red-200/50">
                    <Youtube className="h-6 w-6" />
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
                }
              />
              <MobileDataCardTable>
                <MobileDataCardRow label="YouTube URL">
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline break-all"
                  >
                    <span className="line-clamp-2">{item.youtubeUrl}</span>
                  </a>
                </MobileDataCardRow>
              </MobileDataCardTable>
            </MobileDataCard>
          ))
        ) : (
          <MobileEmptyCard message="Belum ada data video edukasi." />
        )}
      </CardMobileOnly>

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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data video
              secara permanen.
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
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
