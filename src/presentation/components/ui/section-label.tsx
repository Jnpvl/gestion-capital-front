interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export function SectionLabel({ children, className, light = false }: SectionLabelProps) {
  return (
    <p
      className={[
        "text-xs font-semibold tracking-[0.2em] uppercase",
        light ? "text-brand-gold" : "text-brand-blue",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}
