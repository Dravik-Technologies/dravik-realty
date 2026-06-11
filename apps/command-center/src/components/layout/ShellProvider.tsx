"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface ShellCtx {
  mobileSidebarOpen: boolean;
  sidebarCollapsed: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleCollapsed: () => void;
}

const ShellContext = createContext<ShellCtx | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openMobileSidebar  = useCallback(() => setMobileSidebarOpen(true),        []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false),       []);
  const toggleCollapsed    = useCallback(() => setSidebarCollapsed((v) => !v),    []);

  return (
    <ShellContext.Provider
      value={{
        mobileSidebarOpen,
        sidebarCollapsed,
        openMobileSidebar,
        closeMobileSidebar,
        toggleCollapsed,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell(): ShellCtx {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within <ShellProvider>");
  return ctx;
}
