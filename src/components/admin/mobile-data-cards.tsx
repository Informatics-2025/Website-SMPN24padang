"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * Layout data responsif: tabel di desktop, kartu di mobile.
 *
 * Tabel admin bawaan memaksa kolomnya selebar isi, sehingga di layar sempit
 * teks bertabrakan dan butuh geser kiri-kanan. Di mobile kita ganti dengan
 * kartu bertumpuk supaya tipografi tetap rapi tanpa zoom out maupun scroll
 * horizontal.
 */

export function TableDesktopOnly({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("hidden md:block", className)} {...props} />;
}

export function CardMobileOnly({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3 md:hidden", className)} {...props} />;
}

/** Daftar kartu: tanpa border ganda, dipakai di dalam Card utama. */
export function MobileCardList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

interface MobileCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Slot kanan-atas, biasanya tombol aksi / dropdown. */
  action?: React.ReactNode;
  /** Media di kiri, mis. thumbnail gambar. */
  media?: React.ReactNode;
  /** `heading`, bukan `title`, karena `title` bentrok dengan atribut HTML. */
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
}

export function MobileCard({
  action,
  media,
  heading,
  subtitle,
  className,
  children,
  ...props
}: MobileCardProps) {
  return (
    <div
      className={cn("rounded-xl border bg-card p-3 shadow-sm", className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {media ? <div className="shrink-0">{media}</div> : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 flex-1 text-sm font-semibold leading-snug break-words">
              {heading}
            </p>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
          {subtitle ? (
            <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-3 space-y-2">{children}</div> : null}
    </div>
  );
}

/** Baris label–nilai di dalam kartu; nilai boleh panjang dan akan membungkus. */
export function MobileCardRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2", className)}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="min-w-0 text-sm break-words">{children}</span>
    </div>
  );
}

/** Judul/tab nav berbentuk kapsul yang membungkus rapi di layar sempit. */
export function PillTabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex w-full flex-wrap gap-2 rounded-2xl border bg-muted/50 p-1.5",
        className,
      )}
      {...props}
    />
  );
}

export function PillTabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex-1 basis-[8.5rem] rounded-full px-3 py-2 text-xs font-semibold leading-tight transition-colors sm:text-sm",
        "text-muted-foreground hover:bg-background/70 hover:text-foreground",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
