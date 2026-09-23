"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type LoginState = {
  success: boolean;
  message: string;
};

export async function authenticate(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email dan password wajib diisi." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, message: "Login berhasil." };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Email atau password salah." };
        default:
          return { success: false, message: "Email atau password salah." };
      }
    }
    // `redirect()` di dalam signIn melempar error khusus di Next.js.
    // Error non-auth tetap kita lempar agar navigasi/redirect berjalan.
    throw error;
  }
}
