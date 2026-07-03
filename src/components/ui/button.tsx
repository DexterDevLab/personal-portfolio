import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-strong text-white hover:opacity-90 border border-transparent",
  secondary:
    "border border-border bg-transparent text-foreground hover:border-muted hover:bg-surface",
  ghost: "text-muted hover:text-foreground",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-button px-5 py-2.5 text-sm font-medium transition-[background-color,border-color,color,opacity,transform] duration-200 active:scale-[0.98]";

type ButtonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string; external?: boolean } & Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      "href" | "className" | "children"
    >)
  | ({ href?: undefined; external?: undefined } & Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "className" | "children"
    >)
);

export function Button(props: ButtonProps) {
  const { variant = "primary", className, children, ...restAll } = props;
  const classes = cn(base, variants[variant], className);

  if (restAll.href !== undefined) {
    const { href, external, ...rest } = restAll as {
      href: string;
      external?: boolean;
    } & Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      "href" | "className" | "children"
    >;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const rest = restAll as Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
