import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  centered?: boolean;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  centered,
  as: HeadingTag = 'h2',
  className
}: SectionHeadingProps) {
  const resolvedAlign = centered ? 'center' : align;

  return (
    <div className={cn("flex flex-col", resolvedAlign === 'center' ? "items-center text-center" : "items-start text-left", className)}>
      <HeadingTag className="font-serif text-3xl md:text-4xl text-charcoal">{title}</HeadingTag>
      <div className="h-0.5 w-16 bg-champagne my-4" aria-hidden="true" />
      {subtitle && <p className="font-sans text-charcoal-light max-w-2xl">{subtitle}</p>}
    </div>
  );
}