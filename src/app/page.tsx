import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";
import { Tech } from "@/components/sections/tech";
import { Testimonials } from "@/components/sections/testimonials";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { projects } from "@/content/projects";
import { site } from "@/lib/site";

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: site.person,
        jobTitle: site.role,
        url: site.url,
        email: `mailto:${site.email}`,
        sameAs: [site.github],
        knowsAbout: [
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind CSS",
          "WordPress",
          "WooCommerce",
        ],
      },
      {
        "@type": "WebSite",
        name: site.name,
        url: site.url,
      },
      ...projects.map((p) => ({
        "@type": "CreativeWork",
        name: p.name,
        url: p.url,
        description: p.blurb,
        creator: { "@type": "Person", name: site.person },
      })),
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <Header />
      <main id="main" className="flex-1">
        <Hero />
        <Services />
        <Work />
        <Tech />
        <Testimonials />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
