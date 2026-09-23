"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

/** Tombol simpan yang menampilkan status pending form. */
export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}
