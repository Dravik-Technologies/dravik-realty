import Image from "next/image";
import { cn } from "@dravik/shared";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: "mark" | "wordmark";
};

export function BrandLogo({
  alt = "Dravik Realty",
  className,
  priority = false,
  variant = "wordmark",
}: BrandLogoProps) {
  const isMark = variant === "mark";

  return (
    <span
      className={cn(
        "brand-logo-field relative block overflow-visible rounded-2xl",
        isMark ? "h-10 w-10" : "h-14 w-28",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-[inherit] bg-black/35 blur-lg",
          isMark ? "inset-x-0 -bottom-1 top-4" : "inset-x-2 -bottom-1 top-8"
        )}
      />
      <span className="absolute inset-0 overflow-hidden rounded-[inherit] border border-[#FDFDFD]/15 bg-[#2F2F2F]/55 shadow-[0_8px_18px_rgba(0,0,0,0.28),0_1px_0_rgba(253,253,253,0.2)_inset] backdrop-blur-md">
        <Image
          src="/dravik-realty-logo.png"
          alt={alt}
          fill
          sizes={isMark ? "40px" : "112px"}
          className={cn(
            "pointer-events-none select-none brightness-110 contrast-110 saturate-90",
            isMark ? "object-cover scale-[2.05]" : "object-cover scale-[2.25]"
          )}
          priority={priority}
          style={{ objectPosition: isMark ? "50% 36%" : "50% 43%" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(253,253,253,0.28),rgba(229,228,226,0.06)_34%,rgba(47,47,47,0)_62%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2 top-1 h-px bg-[#FDFDFD]/45"
        />
      </span>
    </span>
  );
}
