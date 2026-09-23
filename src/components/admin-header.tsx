import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { Menu, X } from "lucide-react";
import React from "react";

interface AdminMenuItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  subItems?: AdminMenuItem[];
}

interface AdminHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuItems: AdminMenuItem[];
  pathname: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  menuItems,
  pathname,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:hidden print:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={isMobileOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <h1 className="text-base font-semibold truncate">
        {menuItems
          .flatMap((i) => (i.subItems ? i.subItems : i))
          .find((i) => i.href === pathname)?.label || "Dashboard"}
      </h1>
    </header>
  );
};

export default AdminHeader;
