import { Mail } from "lucide-react";
import { GithubIcon } from "@/components/ui/github-icon";
import { Container } from "@/components/ui/container";
import { navLinks } from "@/components/layout/nav-links";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span className="font-mono text-sm font-semibold">{site.name}</span>
          <p className="text-xs text-muted">
            Designed &amp; built by {site.shortPerson} with Next.js. ©{" "}
            {new Date().getFullYear()}
          </p>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="inline-flex size-9 items-center justify-center rounded-button border border-border text-muted transition-colors hover:border-muted hover:text-foreground"
          >
            <GithubIcon />
          </a>
          <a
            href={`mailto:${site.email}`}
            aria-label="Email me"
            className="inline-flex size-9 items-center justify-center rounded-button border border-border text-muted transition-colors hover:border-muted hover:text-foreground"
          >
            <Mail className="size-4" aria-hidden="true" />
          </a>
        </div>
      </Container>
    </footer>
  );
}
