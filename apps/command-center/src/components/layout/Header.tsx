"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, ChevronDown, User, LogOut } from "lucide-react";
import type { CommandCenterSession } from "@dravik/contracts/identity";
import { useShell } from "./ShellProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useTenantBranding } from "@/components/brand/TenantBrandingProvider";
import GlobalSearch       from "./GlobalSearch";
import NotificationCenter from "./NotificationCenter";
import { cn } from "@dravik/shared";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":        "Dashboard",
  "/crm/leads":        "Lead Engine & Smart CRM",
  "/crm/prospecting":  "Prospecting & Seller Leads Center",
  "/crm/inbox":        "Unified Inbox",
  "/referrals":        "DRAVIK Partner Network",
  "/realty/mapping":   "Interactive Mapping & IDX",
  "/realty/listings":  "Listings",
  "/realty/transactions": "Transactions",
  "/broker/reports":   "Reports & Analytics",
  "/broker/team":      "Team Management",
  "/lending":          "Mortgage Tools",
  "/broker/settings":  "Settings",
  "/leads":            "Lead Engine & Smart CRM",
  "/prospecting":      "Prospecting & Seller Leads Center",
  "/referral-network": "DRAVIK Partner Network",
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
  const { branding } = useTenantBranding();
  const { openMobileSidebar } = useShell();
  const pathname  = usePathname();
  const pageTitle = resolveTitle(pathname);
  const hideGlobalSearch = pathname === "/referrals";

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (hideGlobalSearch) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hideGlobalSearch]);

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
      <header className="brand-metal-surface h-16 border-b border-[#D1CFCF]/80 shadow-[0_1px_0_rgba(253,253,253,0.8)_inset,0_8px_22px_rgba(17,20,24,0.06)] flex items-center gap-3 px-4 lg:px-5 flex-shrink-0 z-30">

        {/* Mobile hamburger */}
        <button
          aria-label="Open navigation"
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[var(--brand-header-text)] hover:bg-[var(--brand-header-hover)] transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Mobile logo mark */}
        <div className="lg:hidden flex items-center flex-shrink-0">
          <BrandLogo variant="mark" className="h-11 w-11" priority />
        </div>

        {/* Page title — desktop */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0 min-w-0">
          <BrandLogo variant="mark" className="h-11 w-11" priority />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-header-muted)] leading-tight">
              {branding.companyName}
            </p>
            <h1 className="text-sm font-black text-[var(--brand-header-text)] leading-tight truncate">
              {pageTitle}
            </h1>
          </div>
        </div>

        {!hideGlobalSearch && (
          <button
            aria-label="Open global search"
            onClick={() => setSearchOpen(true)}
            className="relative hidden sm:flex flex-1 max-w-md mx-auto items-center gap-2.5 px-4 py-2 bg-white/65 border border-[#2F2F2F]/10 rounded-xl text-[#59616A] hover:border-[#2F2F2F]/25 hover:bg-white/85 transition-all cursor-text text-left shadow-[0_1px_0_rgba(253,253,253,0.7)_inset]"
          >
            <Search size={14} className="flex-shrink-0" />
            <span className="flex-1 truncate text-sm">Search leads, partners, listings...</span>
            <kbd className="hidden md:flex items-center ml-auto text-[10px] text-[#2F2F2F]/70 font-mono bg-[#2F2F2F]/10 border border-[#2F2F2F]/10 rounded px-1.5 py-0.5 flex-shrink-0 leading-none">
              ⌘K
            </kbd>
          </button>
        )}

        {!hideGlobalSearch && (
          <button
            aria-label="Open global search"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden ml-auto p-2 rounded-xl text-[var(--brand-header-text)] hover:bg-[var(--brand-header-hover)] transition-colors"
          >
            <Search size={18} />
          </button>
        )}

        {hideGlobalSearch && <div className="flex-1" />}

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <NotificationCenter />

          {/* User menu */}
          <div ref={userMenuRef} className="relative">
            <button
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-[var(--brand-header-hover)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-sidebar)] border border-[#2F2F2F]/10 flex items-center justify-center flex-shrink-0 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]">
                <span className="text-[#E5E4E2] text-xs font-bold leading-none">{session.user.initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[var(--brand-header-text)] leading-tight">{session.user.name}</p>
                <p className="text-[10px] text-[var(--brand-header-muted)] leading-tight">{session.tenant.name}</p>
              </div>
              <ChevronDown
                size={13}
                className={cn("hidden sm:block text-[var(--brand-header-muted)] transition-transform duration-150", userMenuOpen && "rotate-180")}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-line rounded-2xl shadow-xl overflow-hidden animate-fade-in z-50">
                <div className="px-4 py-3.5 border-b border-line">
                  <p className="text-sm font-bold text-dravik-dark">{session.user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{session.user.title} · {session.tenant.name}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/broker/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-surface transition-colors"
                  >
                    <User size={14} className="text-gray-400" /> My Profile
                  </Link>
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

      <GlobalSearch
        session={session}
        open={!hideGlobalSearch && searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
