"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, ChevronDown, User, LogOut } from "lucide-react";
import type { CommandCenterSession } from "@dravik/contracts/identity";
import { useShell } from "./ShellProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";
import GlobalSearch       from "./GlobalSearch";
import NotificationCenter from "./NotificationCenter";
import { cn } from "@dravik/shared";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":        "Dashboard",
  "/leads":            "Lead Engine & Smart CRM",
  "/prospecting":      "Prospecting & Seller Leads Center",
  "/referral-network": "Global Referral Network",
  "/mapping":          "Interactive Mapping & IDX",
  "/marketing":        "Marketing & Landing Pages",
  "/transactions":     "Transactions",
  "/realty/client-portal": "Client Portal Admin",
  "/portal":           "Client Portal",
  "/reports":          "Reports & Analytics",
  "/team":             "Team Management",
  "/mortgage":         "Mortgage Tools",
  "/inbox":            "Unified Inbox",
  "/settings":         "Settings",
};

function resolveTitle(pathname: string): string {
  for (const [href, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === href || pathname.startsWith(href + "/")) return title;
  }
  return "Dravik Realty";
}

export default function Header({ session }: { session: CommandCenterSession }) {
  const { openMobileSidebar } = useShell();
  const pathname  = usePathname();
  const pageTitle = resolveTitle(pathname);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-line flex items-center gap-3 px-4 lg:px-5 flex-shrink-0 z-30">

        {/* Mobile hamburger */}
        <button
          aria-label="Open navigation"
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-surface hover:text-dravik-dark transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Mobile logo mark */}
        <div className="lg:hidden flex items-center flex-shrink-0">
          <BrandLogo className="h-10 w-24 rounded-lg" priority />
        </div>

        {/* Page title — desktop */}
        <h1 className="hidden lg:block text-sm font-bold text-dravik-dark flex-shrink-0">{pageTitle}</h1>

        {/* Search trigger — opens GlobalSearch overlay */}
        <button
          aria-label="Open global search"
          onClick={() => setSearchOpen(true)}
          className="relative flex-1 max-w-md mx-auto flex items-center gap-2.5 px-4 py-2 bg-surface-2 border border-transparent rounded-xl text-gray-400 hover:border-gold/30 hover:bg-white transition-all cursor-text text-left"
        >
          <Search size={14} className="flex-shrink-0" />
          <span className="flex-1 truncate text-sm">Search leads, agents, properties...</span>
          <kbd className="hidden md:flex items-center ml-auto text-[10px] text-gray-300 font-mono bg-surface-2 border border-line rounded px-1.5 py-0.5 flex-shrink-0 leading-none">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <NotificationCenter />

          {/* User menu */}
          <div ref={userMenuRef} className="relative">
            <button
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-surface-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-dravik-dark flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs font-bold leading-none">{session.user.initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-dravik-dark leading-tight">{session.user.name}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{session.tenant.name}</p>
              </div>
              <ChevronDown
                size={13}
                className={cn("hidden sm:block text-gray-400 transition-transform duration-150", userMenuOpen && "rotate-180")}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-line rounded-2xl shadow-xl overflow-hidden animate-fade-in z-50">
                <div className="px-4 py-3.5 border-b border-line">
                  <p className="text-sm font-bold text-dravik-dark">{session.user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{session.user.title} · {session.tenant.name}</p>
                </div>
                <div className="py-1">
                  <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-surface hover:text-dravik-dark transition-colors">
                    <User size={14} className="text-gray-400" /> My Profile
                  </button>
                </div>
                <div className="border-t border-line py-1">
                  <Link href="/logout" className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                    <LogOut size={14} /> Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
