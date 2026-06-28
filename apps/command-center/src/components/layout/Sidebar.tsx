"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useShell } from "./ShellProvider";
import { NAV_SECTIONS } from "@/modules/registry";
import type { NavEntry } from "@/modules/registry";
import { cn } from "@dravik/shared";

// ─── Single nav item ──────────────────────────────────────────
function NavLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavEntry;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-gold/15 text-gold"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon
        size={18}
        className={cn("flex-shrink-0", isActive ? "text-gold" : "")}
      />
      {!collapsed && (
        <span className={cn("truncate leading-none", isActive && "font-semibold")}>
          {item.label}
        </span>
      )}
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
export default function Sidebar() {
  const { mobileSidebarOpen, sidebarCollapsed, closeMobileSidebar, toggleCollapsed } =
    useShell();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-axen-dark flex-shrink-0",
          // Mobile slide
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "transition-transform duration-300 ease-in-out",
          // Desktop: in-flow, no translate, animate width
          "lg:relative lg:translate-x-0 lg:transition-[width] lg:duration-300",
          // Width
          "w-60",
          sidebarCollapsed ? "lg:w-[72px]" : "lg:w-60"
        )}
      >
        {/* ── Logo ───────────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-white/10 flex-shrink-0 overflow-hidden",
            sidebarCollapsed ? "lg:justify-center lg:px-0" : "px-4 gap-3"
          )}
        >
          {/* Logo glyph */}
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
            <Image
              src="/axen-realty-logo.webp"
              alt="Axen Realty"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>

          {/* Wordmark — hidden when collapsed */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
            )}
          >
            <p className="text-white font-bold text-sm leading-none whitespace-nowrap">
              Axen<span className="text-gold">ONE</span>
            </p>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mt-1 whitespace-nowrap">
              The Platform
            </p>
          </div>
        </div>

        {/* ── Nav sections ────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {/* Section label — hidden when collapsed */}
              {!sidebarCollapsed && (
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-1.5">
                  {section.title}
                </p>
              )}
              {sidebarCollapsed && (
                <div className="border-t border-white/5 mb-3" />
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      collapsed={sidebarCollapsed}
                      onClick={closeMobileSidebar}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom: settings + collapse toggle ──────────── */}
        <div className="flex-shrink-0 border-t border-white/10 py-3 px-2 space-y-0.5">
          {/* Settings link */}
          <NavLink
            item={{ label: "Settings", icon: Settings, href: "/broker/settings" }}
            isActive={pathname.startsWith("/broker/settings")}
            collapsed={sidebarCollapsed}
            onClick={closeMobileSidebar}
          />

          {/* Collapse toggle (desktop only) */}
          <button
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
            className={cn(
              "hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-colors",
              sidebarCollapsed && "justify-center px-0"
            )}
          >
            {sidebarCollapsed ? (
              <PanelLeft size={18} />
            ) : (
              <>
                <PanelLeftClose size={18} className="flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
