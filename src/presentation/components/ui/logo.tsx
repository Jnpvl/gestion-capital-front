import Image from "next/image";
import { cn } from "@/shared/lib/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const sizes = {
  sm: {
    icon: "h-9 w-9",
    title: "text-base",
    subtitle: "text-[9px]",
  },
  md: {
    icon: "h-10 w-10",
    title: "text-lg",
    subtitle: "text-[10px]",
  },
  lg: {
    icon: "h-14 w-14 sm:h-16 sm:w-16",
    title: "text-2xl sm:text-3xl",
    subtitle: "text-[11px] sm:text-xs",
  },
} as const;

export function Logo({ size = "md", className, priority = false }: LogoProps) {
  const config = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/images/icon.png"
        alt=""
        width={64}
        height={64}
        className={cn(config.icon, "shrink-0 brightness-0")}
        priority={priority}
        aria-hidden="true"
      />
      <div className="leading-tight">
        <span
          className={cn(
            "block font-display font-bold tracking-tight text-brand-gray",
            config.title,
          )}
        >
          Gestiona
        </span>
        <span
          className={cn(
            "block font-medium tracking-[0.22em] text-brand-muted uppercase",
            config.subtitle,
          )}
        >
          Capital Humano
        </span>
      </div>
    </div>
  );
}
