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
  const edgeFade =
    "radial-gradient(ellipse 74% 70% at 50% 50%, #000 58%, rgba(0,0,0,0.9) 68%, transparent 100%)";
  const edgeBlur =
    "radial-gradient(ellipse 86% 82% at 50% 50%, transparent 48%, rgba(0,0,0,0.78) 68%, #000 100%)";

  return (
    <span
      className={cn(
        "relative block overflow-visible",
        isMark ? "h-10 w-10" : "h-14 w-36",
        className
      )}
    >
      <Image
        src="/dravik-realty-logo.png"
        alt=""
        aria-hidden
        fill
        sizes={isMark ? "40px" : "176px"}
        className={cn(
          "pointer-events-none select-none object-contain opacity-80 blur-md",
          isMark ? "scale-[1.56]" : "scale-[1.16]"
        )}
        style={{
          objectPosition: "50% 50%",
          WebkitMaskImage: edgeBlur,
          maskImage: edgeBlur,
        }}
      />
      <Image
        src="/dravik-realty-logo.png"
        alt={alt}
        fill
        sizes={isMark ? "40px" : "176px"}
        className={cn(
          "drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)]",
          isMark
            ? "object-contain scale-[1.45]"
            : "object-contain scale-[1.08]"
        )}
        priority={priority}
        style={{
          objectPosition: "50% 50%",
          WebkitMaskImage: edgeFade,
          maskImage: edgeFade,
        }}
      />
    </span>
  );
}
