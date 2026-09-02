"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { videos as VideoSchema } from "@/lib/db/schema";
import type { VideoActionState } from "@/types/action-state";
import { type InferSelectModel } from "drizzle-orm";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

type Video = InferSelectModel<typeof VideoSchema>;

function SubmitButton({ pendingText = "Saving..." }: { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : "Save"}
    </Button>
  );
}

export function VideoForm({
  action,
  initialData,
  onClose,
}: {
  action: (
    state: VideoActionState,
    formData: FormData,
  ) => Promise<{ message: string; error?: string }>;
  initialData?: Video | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(action, {
    message: "",
    error: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.error) {
      toast({ title: "Success!", description: state.message });
      onClose();
    } else if (state.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData?.title}
          required
        />
      </div>
      <div>
        <Label htmlFor="youtubeUrl">YouTube URL</Label>
        <Input
          id="youtubeUrl"
          name="youtubeUrl"
          defaultValue={initialData?.youtubeUrl}
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
