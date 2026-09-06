"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AdaptiveBreadcrumbProps {
  /** Override label kustom untuk segmen URL tertentu (misal slug ID dinamis) */
  labels?: Record<string, string>;
  /** Sembunyikan breadcrumb saat berada di homepage ("/") - default: true */
  hideOnHome?: boolean;
  /** Custom URL untuk segmen Home (default: "/") */
  homeHref?: string;
  /** Custom label untuk segmen Home (default: "Beranda") */
  homeLabel?: string;
  /** ClassName kustom untuk elemen nav pembungkus */
  className?: string;
}

/**
 * Helper untuk memformat slug kebab-case atau snake_case menjadi Title Case.
 * Contoh: "prestasi-siswa" -> "Prestasi Siswa"
 */
function formatSegmentTitle(segment: string): string {
  return decodeURIComponent(segment)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function AdaptiveBreadcrumb({
  labels = {},
  hideOnHome = true,
  homeHref = "/",
  homeLabel = "Beranda",
  className,
}: AdaptiveBreadcrumbProps) {
  const pathname = usePathname();

  // Pisahkan path URL menjadi array segmen
  const segments = React.useMemo(() => {
    return (pathname || "").split("/").filter(Boolean);
  }, [pathname]);

  // Jika berada di root/beranda dan hideOnHome bernilai true
  if (segments.length === 0 && hideOnHome) {
    return null;
  }

  // Susun data item breadcrumb
  const items = React.useMemo(() => {
    let accumulatedPath = "";
    return segments.map((segment, index) => {
      accumulatedPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      const label = labels[segment] || formatSegmentTitle(segment);

      return {
        segment,
        label,
        href: accumulatedPath,
        isLast,
      };
    });
  }, [segments, labels]);

  // Segmen perantara (semua sebelum halaman aktif)
  const middleItems = items.slice(0, -1);
  const lastItem = items[items.length - 1];

  // Mobile-first logic: jika segmen path > 2, collapse segmen tengah ke dropdown menu
  const hasCollapsedMiddle = segments.length > 2;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2">
        {/* Segmen Pertama: Home */}
        <li className="inline-flex items-center gap-1.5">
          <Link
            href={homeHref}
            aria-label={homeLabel}
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span className="sr-only">{homeLabel}</span>
          </Link>
        </li>

        {/* Separator setelah Home jika ada segmen sub-halaman */}
        {items.length > 0 && (
          <li
            role="presentation"
            aria-hidden="true"
            className="text-muted-foreground select-none"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
        )}

        {/* Kasus 1: Segmen > 2 (Mobile Ellipsis Dropdown vs Desktop Full Hierarchy) */}
        {hasCollapsedMiddle ? (
          <>
            {/* MOBILE ONLY (< sm): Dropdown Menu Ellipsis (...) */}
            <li className="inline-flex items-center gap-1.5 sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex h-6 w-6 items-center justify-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Tampilkan segmen lainnya"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {middleItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="w-full truncate text-xs">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>

            {/* Separator setelah Dropdown di Mobile */}
            <li
              role="presentation"
              aria-hidden="true"
              className="text-muted-foreground select-none sm:hidden"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </li>

            {/* DESKTOP ONLY (>= sm): Tampilkan seluruh hirarki segmen tengah */}
            {middleItems.map((item) => (
              <React.Fragment key={item.href}>
                <li className="hidden sm:inline-flex items-center gap-1.5">
                  <Link
                    href={item.href}
                    className="max-w-[100px] truncate text-muted-foreground transition-colors hover:text-foreground sm:max-w-none"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                </li>
                <li
                  role="presentation"
                  aria-hidden="true"
                  className="hidden text-muted-foreground select-none sm:inline-flex"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
              </React.Fragment>
            ))}
          </>
        ) : (
          /* Kasus 2: Segmen <= 2 (Tampil normal baik di mobile maupun desktop) */
          middleItems.map((item) => (
            <React.Fragment key={item.href}>
              <li className="inline-flex items-center gap-1.5">
                <Link
                  href={item.href}
                  className="max-w-[100px] truncate text-muted-foreground transition-colors hover:text-foreground sm:max-w-none"
                  title={item.label}
                >
                  {item.label}
                </Link>
              </li>
              <li
                role="presentation"
                aria-hidden="true"
                className="text-muted-foreground select-none"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            </React.Fragment>
          ))
        )}

        {/* Segmen Terakhir: Halaman Aktif (Non-clickable, aria-current="page") */}
        {lastItem && (
          <li className="inline-flex items-center">
            <span
              aria-current="page"
              className="max-w-[120px] truncate font-semibold text-foreground sm:max-w-none"
              title={lastItem.label}
            >
              {lastItem.label}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

export default AdaptiveBreadcrumb;
