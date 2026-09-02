"use client";

import {
  createVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from "@/app/admin/videos/actions";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { videos } from "@/lib/db/schema";
import type { VideoActionState } from "@/types/action-state";
import type { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { VideoForm } from "./video-form";

type Video = InferSelectModel<typeof videos>;
type VideoFormAction = (
  state: VideoActionState,
  formData: FormData,
) => Promise<VideoActionState>;

function getVideoFormData(formData: FormData) {
  const title = formData.get("title");
  const youtubeUrl = formData.get("youtubeUrl");

  if (typeof title !== "string" || typeof youtubeUrl !== "string") {
    return null;
  }

  return { title, youtubeUrl };
}

export default function VideosClient({
  initialVideos,
}: {
  initialVideos: Video[];
}) {
  const [allVideos, setAllVideos] = useState<Video[]>(initialVideos);
  const [dialog, setDialog] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const refreshData = async () => {
    const result = await getVideos();
    if (result.success) {
      setAllVideos(result.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to refresh videos",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = (refresh = false) => {
    setDialog(null);
    setSelectedVideo(null);
    if (refresh) {
      refreshData();
    }
  };

  const handleDelete = () => {
    if (!selectedVideo) return;
    startTransition(async () => {
      const result = await deleteVideo(selectedVideo.id);
      if (result.success) {
        toast({ title: "Success!", description: result.message });
        handleCloseDialog(true);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const videoFormAction: VideoFormAction = async (_state, formData) => {
    const data = getVideoFormData(formData);
    if (!data) return { message: "", error: "Data video tidak valid." };

    if (dialog === "add") {
      const result = await createVideo(data);
      return result.success
        ? { message: result.message }
        : { message: "", error: result.message };
    }

    if (!selectedVideo) return { message: "", error: "Video belum dipilih." };

    const result = await updateVideo(selectedVideo.id, data);
    return result.success
      ? { message: result.message }
      : { message: "", error: result.message };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Videos</h1>
        <Button onClick={() => setDialog("add")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Video
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>YouTube URL</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVideos.length > 0 ? (
              allVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {video.youtubeUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    {new Date(video.createdAt).toLocaleDateString()}
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
                            setSelectedVideo(video);
                            setDialog("edit");
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => {
                            setSelectedVideo(video);
                            setDialog("delete");
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No videos found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <Dialog
        open={dialog === "add" || dialog === "edit"}
        onOpenChange={() => handleCloseDialog()}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialog === "add" ? "Add New Video" : "Edit Video"}
            </DialogTitle>
          </DialogHeader>
          <VideoForm
            action={videoFormAction}
            initialData={dialog === "edit" ? selectedVideo : null}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the video and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
