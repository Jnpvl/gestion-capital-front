import { cn } from "@/shared/lib/cn";

interface SectionHeadingProps {
  title: string;
  className?: string;
  light?: boolean;
}

export function SectionHeading({ title, className, light = false }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "text-center text-2xl font-light tracking-[0.3em] uppercase sm:text-3xl",
        light ? "text-white" : "text-brand-dark",
        className,
      )}
    >
      {title}
    </h2>
  );
}
