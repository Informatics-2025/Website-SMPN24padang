"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { FaqSchema } from "./schema";

export async function getFaqs() {
  try {
    return await db.select().from(faqs).orderBy(desc(faqs.createdAt));
  } catch (error) {
    console.error("Error fetching faqs:", error);
    return [];
  }
}

export async function createFaq(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const validatedFields = FaqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
  });

  if (!validatedFields.success) {
    const errorMessages = Object.values(
      validatedFields.error.flatten().fieldErrors,
    )
      .flat()
      .join(", ");
    return { success: false, message: `Validasi gagal: ${errorMessages}` };
  }

  const { question, answer } = validatedFields.data;

  try {
    await db.insert(faqs).values({
      id: uuidv4(),
      question,
      answer,
    });

    revalidateTag("faqs-collection");
    revalidatePath("/contact"); // Revalidate contact page
    revalidatePath("/"); // Revalidate homepage (assuming it has FAQ)
    revalidatePath("/admin/faq");
    return { success: true, message: "FAQ berhasil ditambahkan." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menambahkan FAQ." };
  }
}

export async function updateFaq(
  id: string,
  prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const validatedFields = FaqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
  });

  if (!validatedFields.success) {
    const errorMessages = Object.values(
      validatedFields.error.flatten().fieldErrors,
    )
      .flat()
      .join(", ");
    return { success: false, message: `Validasi gagal: ${errorMessages}` };
  }

  const { question, answer } = validatedFields.data;

  try {
    await db.update(faqs).set({ question, answer }).where(eq(faqs.id, id));

    revalidateTag("faqs-collection");
    revalidatePath("/contact"); // Revalidate contact page
    revalidatePath("/"); // Revalidate homepage (assuming it has FAQ)
    revalidatePath("/admin/faq");
    return { success: true, message: "FAQ berhasil diperbarui." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui FAQ." };
  }
}

export async function deleteFaq(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  try {
    await db.delete(faqs).where(eq(faqs.id, id));

    revalidateTag("faqs-collection");
    revalidatePath("/contact"); // Revalidate contact page
    revalidatePath("/"); // Revalidate homepage (assuming it has FAQ)
    revalidatePath("/admin/faq");
    return { success: true, message: "FAQ berhasil dihapus." };
  } catch (error: unknown) {
    console.error("Database deletion failed:", error);
    return {
      success: false,
      message: `Gagal menghapus FAQ: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
