"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * Komponen pembungkus responsif:
 * - Desktop: menampilkan tabel asli yang padat data.
 * - Mobile: menampilkan kartu berstruktur tabel (tabular card) yang seimbang dan terbaca rapi.
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
  return <div className={cn("space-y-3.5 md:hidden", className)} {...props} />;
}

/** Kontainer kartu data mobile */
export function MobileDataCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm transition-all hover:border-border overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

interface MobileDataCardHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  media?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

/** Bagian kepala kartu: thumbnail gambar/avatar, judul utama, subtitle, dan tombol aksi */
export function MobileDataCardHeader({
  media,
  title,
  subtitle,
  action,
  className,
  ...props
}: MobileDataCardHeaderProps) {
  return (
    <div
      className={cn("flex items-start gap-3 p-3.5 sm:p-4 bg-card", className)}
      {...props}
    >
      {media ? (
        <div className="shrink-0 flex items-center justify-center">
          {media}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold leading-snug text-foreground break-words">
              {title}
            </div>
            {subtitle ? (
              <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 break-words">
                {subtitle}
              </div>
            ) : null}
          </div>
          {action ? (
            <div className="shrink-0 -mr-1 -mt-1">
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Kontainer data tabular di dalam kartu berpenampilan seperti tabel */
export function MobileDataCardTable({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t border-border/70 divide-y divide-border/60 bg-muted/10 text-xs sm:text-sm",
        className
      )}
      {...props}
    />
  );
}

/** Baris tabular (Label di kolom kiri, Nilai di kolom kanan) */
export function MobileDataCardRow({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-stretch text-xs transition-colors hover:bg-muted/20",
        className
      )}
    >
      <div className="w-28 sm:w-32 shrink-0 bg-muted/40 px-3 py-2 font-medium text-muted-foreground border-r border-border/60 flex items-center">
        {label}
      </div>
      <div className="min-w-0 flex-1 px-3 py-2 text-foreground break-words flex items-center">
        {children}
      </div>
    </div>
  );
}

/** Tampilan saat data kosong pada mobile */
export function MobileEmptyCard({
  message = "Belum ada data.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center text-sm text-muted-foreground",
        className
      )}
    >
      {message}
    </div>
  );
}

// Kompatibilitas alias lama jika dibutuhkan
export const MobileCard = MobileDataCard;
export const MobileCardRow = MobileDataCardRow;
export const MobileCardList = CardMobileOnly;

/** Judul/tab nav berbentuk kapsul yang membungkus rapi di layar sempit */
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
