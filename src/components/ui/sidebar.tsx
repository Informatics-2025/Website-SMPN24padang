// src/components/ui/sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Pastikan framer-motion sudah terinstal
import { ChevronDown, ChevronUp, LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Collapsible from "@radix-ui/react-collapsible";

// --- Context for Sidebar State ---
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false); // You might want to persist this state or control it from parent

  const value = React.useMemo(
    () => ({ isCollapsed, setIsCollapsed }),
    [isCollapsed]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// --- Main Sidebar Components ---

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { isCollapsed } = useSidebar();
  return (
    <aside
      className={cn(
        // Layout: flex column, full viewport height, no scroll on the aside itself
        "flex flex-col h-screen overflow-hidden",
        // Light mode: green gradient
        "bg-gradient-to-b from-emerald-700 to-emerald-900",
        // Dark mode: soft dark (not harsh white)
        "dark:from-slate-800 dark:to-slate-900",
        "shadow-xl transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
      data-state={isCollapsed ? "collapsed" : "expanded"}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center p-4 shrink-0",
        "border-b border-emerald-600/50 dark:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    // flex-1 + min-h-0 + overflow-y-auto: menu scrolls inside, footer stays pinned
    <div className={cn("flex-1 min-h-0 overflow-y-auto p-3", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    // shrink-0: footer never gets pushed off screen
    <div
      className={cn(
        "p-4 shrink-0",
        "border-t border-emerald-600/50 dark:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={cn(
        "p-2 rounded-md transition-colors",
        "hover:bg-white/10 dark:hover:bg-slate-700",
        "text-white/80 hover:text-white",
        className
      )}
      {...props}
    >
      {isCollapsed ? (
        <ChevronRight className="h-5 w-5" />
      ) : (
        <ChevronLeft className="h-5 w-5" />
      )}
    </button>
  );
}

// --- Menu Components ---

export function SidebarMenu({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("space-y-0.5", className)} {...props}>
      {children}
    </ul>
  );
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isActive?: boolean;
}

export function SidebarMenuItem({
  className,
  children,
  isActive,
  ...props
}: SidebarMenuItemProps) {
  return (
    <li
      className={cn(
        "relative",
        isActive && "text-primary", // Example active state styling
        className
      )}
      {...props}
    >
      {children}
    </li>
  );
}

interface CommonSidebarMenuButtonProps {
  icon?: LucideIcon;
  isActive?: boolean;
  className?: string;
  isCollapsibleTrigger?: boolean; // New prop
  isMenuOpen?: boolean; // New prop for icon rotation
}

interface SidebarMenuButtonAsLinkProps extends CommonSidebarMenuButtonProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

interface SidebarMenuButtonAsButtonProps extends CommonSidebarMenuButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never; // Ensures href is not present when it's a button
}

type SidebarMenuButtonProps = SidebarMenuButtonAsLinkProps | SidebarMenuButtonAsButtonProps;

export function SidebarMenuButton({
  href,
  icon: Icon,
  isActive,
  children,
  className,
  isCollapsibleTrigger,
  isMenuOpen,
  ...props
}: SidebarMenuButtonProps) {
  const { isCollapsed } = useSidebar();

  const commonContent = (
    <div className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-2.5")}>
      {Icon && (
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            isActive
              ? "text-white"
              : "text-emerald-100 dark:text-slate-300"
          )}
        />
      )}
      <span className={cn(isCollapsed ? "hidden" : "block truncate text-sm")}>
        {children}
      </span>
    </div>
  );

  const commonClassName = cn(
    "flex items-center w-full px-3 py-2 rounded-lg transition-all duration-150",
    isActive
      ? "bg-white/20 text-white font-semibold shadow-sm"
      : "text-emerald-50 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-700/60",
    isCollapsed
      ? "justify-center"
      : isCollapsibleTrigger
      ? "justify-between"
      : "justify-start",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={commonClassName}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {commonContent}
      </Link>
    );
  } else {
    return (
      <button
        type="button"
        className={commonClassName}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {commonContent}
        {isCollapsibleTrigger && (
          <ChevronRight
            className={cn(
              "ml-auto h-4 w-4 shrink-0 transition-transform ease-in-out",
              "text-emerald-200 dark:text-slate-400",
              isMenuOpen ? "rotate-90" : ""
            )}
          />
        )}
      </button>
    );
  }
}

export function SidebarMenuSub({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("space-y-0.5 mt-0.5", className)} {...props}>
      {children}
    </ul>
  );
}

interface SidebarMenuSubItemProps extends React.HTMLAttributes<HTMLLIElement> {}

export function SidebarMenuSubItem({
  className,
  children,
  ...props
}: SidebarMenuSubItemProps) {
  return (
    <li className={cn(className)} {...props}>
      {children}
    </li>
  );
}

interface SidebarMenuSubButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  isActive?: boolean;
  children: React.ReactNode;
}

export function SidebarMenuSubButton({
  href,
  isActive,
  children,
  className,
  ...props
}: SidebarMenuSubButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-3 py-1.5 pl-8 rounded-lg transition-all duration-150 text-sm",
        isActive
          ? "bg-white/20 text-white font-medium"
          : "text-emerald-100/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700/60 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
