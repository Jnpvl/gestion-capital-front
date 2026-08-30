import { cn } from "@/shared/lib/cn";
import { Container } from "@/presentation/components/ui/container";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "white" | "light";
}

export function PageSection({ children, className, variant = "white" }: PageSectionProps) {
  return (
    <section
      className={cn(
        "py-16 sm:py-20",
        variant === "light" ? "bg-brand-light" : "bg-white",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
