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
  const edgeFade = isMark
    ? "radial-gradient(ellipse 78% 74% at 50% 50%, #000 52%, rgba(0,0,0,0.88) 68%, transparent 100%)"
    : "radial-gradient(ellipse 58% 70% at 50% 50%, #000 42%, rgba(0,0,0,0.72) 60%, transparent 90%)";
  const softFade = isMark
    ? "radial-gradient(ellipse 92% 88% at 50% 50%, #000 30%, rgba(0,0,0,0.72) 58%, transparent 100%)"
    : "radial-gradient(ellipse 72% 82% at 50% 50%, #000 28%, rgba(0,0,0,0.62) 56%, transparent 100%)";
  const platinumGlow =
    "radial-gradient(ellipse 84% 72% at 50% 50%, rgba(253,253,253,0.16), rgba(229,228,226,0.08) 38%, rgba(47,47,47,0) 76%)";

  return (
    <span
      className={cn(
        "brand-logo-field relative block overflow-visible",
        isMark ? "h-10 w-10" : "h-14 w-36",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-full blur-xl",
          isMark ? "-inset-2" : "-inset-3"
        )}
        style={{ background: platinumGlow }}
      />
      <Image
        src="/dravik-realty-logo.png"
        alt=""
        aria-hidden
        fill
        sizes={isMark ? "40px" : "176px"}
        className={cn(
          "pointer-events-none select-none object-cover opacity-75 blur-md brightness-110 contrast-110",
          isMark ? "scale-[1.7]" : "scale-[1.24]"
        )}
        style={{
          objectPosition: "50% 50%",
          WebkitMaskImage: softFade,
          maskImage: softFade,
          mixBlendMode: "screen",
        }}
      />
      <Image
        src="/dravik-realty-logo.png"
        alt={alt}
        fill
        sizes={isMark ? "40px" : "176px"}
        className={cn(
          "pointer-events-none select-none drop-shadow-[0_10px_24px_rgba(0,0,0,0.32)] brightness-105 contrast-105",
          isMark
            ? "object-cover scale-[1.58]"
            : "object-cover scale-[1.12]"
        )}
        priority={priority}
        style={{
          objectPosition: "50% 50%",
          WebkitMaskImage: edgeFade,
          maskImage: edgeFade,
          mixBlendMode: "screen",
        }}
      />
    </span>
  );
}
