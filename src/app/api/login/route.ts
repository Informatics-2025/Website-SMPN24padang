import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 },
      );
    }

    await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil.",
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan tak terduga." },
      { status: 500 },
    );
  }
}
