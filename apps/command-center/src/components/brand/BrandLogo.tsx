"use client";

import Image from "next/image";
import { cn } from "@dravik/shared";
import { useTenantBranding } from "./TenantBrandingProvider";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: "mark" | "wordmark";
};

export function BrandLogo({
  alt,
  className,
  priority = false,
  variant = "wordmark",
}: BrandLogoProps) {
  const { branding } = useTenantBranding();
  const isMark = variant === "mark";
  const label = alt ?? branding.companyName;

  return (
    <span
      className={cn(
        "brand-logo-field relative inline-flex items-center overflow-visible",
        isMark ? "h-12 w-12" : "h-12 w-44 gap-3",
        className
      )}
      aria-label={label}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-[1.35rem] bg-[#111418]/20 blur-xl",
          isMark ? "inset-x-1 -bottom-2 top-6" : "left-1 -bottom-2 top-6 w-12"
        )}
      />
      <span
        className={cn(
          "relative flex h-full shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem]",
          "bg-[linear-gradient(135deg,#FDFDFD_0%,#E5E4E2_38%,#D1CFCF_66%,#AEB6BF_100%)]",
          "shadow-[0_10px_22px_rgba(17,20,24,0.16),0_1px_0_rgba(253,253,253,0.8)_inset,0_-1px_0_rgba(47,47,47,0.12)_inset]",
          isMark ? "w-full" : "aspect-square"
        )}
      >
        {branding.logoDataUrl ? (
          <Image
            src={branding.logoDataUrl}
            alt={label}
            width={96}
            height={96}
            unoptimized
            priority={priority}
            className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_4px_7px_rgba(17,20,24,0.22)]"
            draggable={false}
          />
        ) : (
          <span
            aria-hidden
            className="relative z-10 select-none text-[1.35rem] font-black leading-none text-[#2F2F2F] drop-shadow-[0_1px_0_rgba(253,253,253,0.75)]"
          >
            {branding.companyInitials}
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(253,253,253,0.54),rgba(253,253,253,0.08)_38%,rgba(47,47,47,0.1)_100%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-1.5 h-px bg-[#FDFDFD]/80"
        />
      </span>
      {!isMark && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-black uppercase text-[var(--brand-header-text)]">
            {branding.companyInitials}
          </span>
          <span className="block truncate text-[11px] font-semibold text-[#59616A]">
            {branding.companyName}
          </span>
        </span>
      )}
    </span>
  );
}
