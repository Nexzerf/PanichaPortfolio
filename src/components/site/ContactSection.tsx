import { Reveal, RevealText } from "../motion/Reveal";
import { ContactForm } from "./ContactForm";
import type { SocialLink } from "@/lib/types";

export function ContactSection({
  heading,
  text,
  email,
  phone,
  socials,
  labels,
}: {
  heading: string;
  text: string;
  email: string | null;
  phone: string | null;
  socials: SocialLink[];
  labels: {
    name: string; email: string; message: string; send: string; sending: string;
    sent: string; error: string; rateLimited: string; invalid: string; social: string;
  };
}) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-y relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent)" }}
      />
      <div className="container-x relative grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div>
          <Reveal className="kicker mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-accent" aria-hidden />
            Contact
          </Reveal>
          <RevealText as="h2" text={heading} className="font-display text-display font-light tracking-tight" />
          {text && (
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-md text-lead text-ink-2">{text}</p>
            </Reveal>
          )}
          <Reveal delay={0.25} className="mt-12 space-y-8">
            {email && (
              <a
                href={`mailto:${email}`}
                className="group inline-flex items-center gap-4 font-display text-[clamp(1.25rem,2.6vw,2rem)] font-light"
              >
                <span className="link-underline">{email}</span>
                <span aria-hidden className="text-accent transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
              </a>
            )}
            {phone && <p className="text-ink-2">{phone}</p>}
            {socials.length > 0 && (
              <div>
                <p className="kicker mb-4">{labels.social}</p>
                <ul className="flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition-colors duration-300 hover:border-accent hover:text-ink"
                      >
                        {s.label || s.platform}
                        <span aria-hidden className="text-ink-3">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <ContactForm labels={labels} />
        </Reveal>
      </div>
    </section>
  );
}
