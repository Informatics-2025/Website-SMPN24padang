import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";
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
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden print:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Buka menu"
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <h1 className="text-lg font-semibold">
        {menuItems
          .flatMap((i) => (i.subItems ? i.subItems : i))
          .find((i) => i.href === pathname)?.label || "Dashboard"}
      </h1>
    </header>
  );
};

export default AdminHeader;
