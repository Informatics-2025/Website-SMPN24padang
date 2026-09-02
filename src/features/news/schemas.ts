import { news } from "@/lib/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const NewsArticleSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  date: z.coerce.date({
    errorMap: () => ({ message: "Format tanggal tidak valid" }),
  }),
  image: z
    .custom<File | null>(
      (value): value is File | null => value === null || value instanceof File,
      "File gambar tidak valid.",
    )
    .refine(
      (file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE,
      `Ukuran gambar maksimal 5MB.`,
    )
    .refine(
      (file) =>
        !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Format gambar yang didukung hanya .jpg, .jpeg, .png, dan .webp.",
    ),
});

export type NewsArticleFormData = z.infer<typeof NewsArticleSchema>;

export const SelectNewsArticleSchema = createSelectSchema(news);
export type NewsArticle = z.infer<typeof SelectNewsArticleSchema>;
