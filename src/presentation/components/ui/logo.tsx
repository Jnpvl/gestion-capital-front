import Image from "next/image";
import { cn } from "@/shared/lib/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const sizes = {
  sm: { width: 148, height: 48, className: "h-9 w-auto" },
  md: { width: 180, height: 58, className: "h-10 w-auto" },
  lg: { width: 240, height: 78, className: "h-12 w-auto sm:h-14" },
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
