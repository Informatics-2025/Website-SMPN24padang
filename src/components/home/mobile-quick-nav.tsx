import Link from "next/link";
import { Award, Megaphone, Recycle, School, Users } from "lucide-react";

const mobileQuickLinks = [
  {
    href: "/profile",
    label: "Profil",
    icon: School,
  },
  {
    href: "/profile/faculty",
    label: "Guru & Staf",
    icon: Users,
  },
  {
    href: "/achievements",
    label: "Prestasi",
    icon: Award,
  },
  {
    href: "/pengumuman",
    label: "Pengumuman",
    icon: Megaphone,
  },
  {
    href: "/sispendik",
    label: "Sispendig",
    icon: Recycle,
  },
];

export function MobileQuickNav() {
  return (
    <nav
      aria-label="Menu cepat"
      className="border-b border-emerald-500/15 bg-background px-3 py-3 md:hidden"
    >
      <div className="grid grid-cols-5 gap-2">
        {mobileQuickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-emerald-500/15 bg-card px-1.5 py-2 text-center shadow-sm transition-colors hover:bg-emerald-500/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-[10px] font-semibold leading-tight text-foreground">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
