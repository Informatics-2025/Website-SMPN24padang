"use client";

import MonsterBackground from "@/components/monster-background";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-green-50 to-emerald-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Monster animasi di belakang konten */}
      <MonsterBackground
        className="select-none scale-[1.2] -translate-y-[28%]"
        animationUrl="https://assets9.lottiefiles.com/packages/lf20_e3zt5qof.json"
      />

      {/* Konten utama */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-2xl px-6 py-16"
      >
        <div className="rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md shadow-xl ring-1 ring-black/5 dark:ring-white/5 p-8 md:p-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400"
          >
            404 — Halaman Tidak Ditemukan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-base sm:text-lg text-neutral-700 dark:text-neutral-200"
          >
            Ups! Sepertinya Anda tersesat. Mari kita kembali ke jalan yang benar
            dan terus merawat lingkungan kita.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex items-center justify-center"
          >
            <Button
              asChild
              className="group bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 text-base sm:text-lg h-auto rounded-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 shadow-lg transition-all"
              aria-label="Kembali ke Beranda"
            >
              <Link href="/">
                <span className="inline-flex items-center gap-2">
                  <Home className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                  Kembali ke Beranda
                </span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Lapisan halus untuk depth tambahan di tepi layar */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(60%_40%_at_50%_30%,rgba(16,185,129,0.08),transparent_70%)] dark:bg-[radial-gradient(60%_40%_at_50%_30%,rgba(16,185,129,0.12),transparent_70%)]" />
    </div>
  );
}
