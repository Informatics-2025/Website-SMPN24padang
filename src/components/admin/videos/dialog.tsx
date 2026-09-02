"use client";

import { createVideo, updateVideo } from "@/app/admin/videos/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getYouTubeVideoId } from "@/components/youtube-embed";
import type { videos } from "@/lib/db/schema";
import { useEffect, useState } from "react";

export function VideoDialog({
  open,
  onOpenChange,
  video,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: typeof videos.$inferSelect | null;
}) {
  const [formData, setFormData] = useState({ title: "", youtubeUrl: "" });

  useEffect(() => {
    if (video) {
      setFormData({ title: video.title, youtubeUrl: video.youtubeUrl });
    }
  }, [video]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const videoId = getYouTubeVideoId(formData.youtubeUrl);
    if (!videoId) {
      alert("Invalid YouTube URL. Please enter a valid YouTube video URL.");
      return;
    }

    if (video) {
      await updateVideo(video.id, {
        ...formData,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    } else {
      await createVideo({
        ...formData,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{video ? "Edit Video" : "Add Video"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">
            {video ? "Save Changes" : "Create Video"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
