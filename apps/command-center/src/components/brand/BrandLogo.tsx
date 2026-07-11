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
        "relative block overflow-hidden rounded-xl border border-white/10 bg-dravik-dark shadow-sm",
        isMark ? "h-10 w-10" : "h-14 w-36",
        className
      )}
    >
      <Image
        src="/dravik-realty-logo.png"
        alt={alt}
        fill
        sizes={isMark ? "40px" : "176px"}
        className={cn(
          isMark
            ? "object-cover scale-[1.6]"
            : "object-contain scale-[1.55]"
        )}
        priority={priority}
        style={{ objectPosition: isMark ? "50% 35%" : "50% 45%" }}
      />
    </span>
  );
}
