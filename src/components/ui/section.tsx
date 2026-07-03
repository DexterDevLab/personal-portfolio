import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 md:py-28", className)}>
      <Container>{children}</Container>
    </section>
  );
}
