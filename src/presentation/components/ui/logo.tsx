import Image from "next/image";
import { cn } from "@/shared/lib/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const sizes = {
  sm: { width: 160, height: 48, className: "h-9 w-auto" },
  md: { width: 196, height: 59, className: "h-10 w-auto" },
  lg: { width: 260, height: 79, className: "h-12 w-auto sm:h-14" },
} as const;

export function Logo({ size = "md", className, priority = false }: LogoProps) {
  const config = sizes[size];

  return (
    <Image
      src="/images/logo.png"
      alt="Gestiona Capital Humano"
      width={config.width}
      height={config.height}
      className={cn(config.className, "brightness-0", className)}
      priority={priority}
      loading="eager"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
