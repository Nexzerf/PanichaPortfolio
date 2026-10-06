"use client";
import { useId } from "react";

export const inputCls =
  "w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-light">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ title, description, children, id, actions }: {
  title?: string; description?: string; children: React.ReactNode; id?: string; actions?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-line bg-[#070b1f] p-5 sm:p-6">
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-lg">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "subtle"; size?: "sm" | "md" };
export function Button({ variant = "ghost", size = "md", className = "", ...rest }: ButtonProps) {
  const v = {
    primary: "bg-accent text-white hover:brightness-110",
    ghost: "border border-line-strong text-ink hover:bg-white/[0.05]",
    danger: "border border-danger/40 text-danger hover:bg-danger/10",
    subtle: "text-ink-2 hover:text-ink hover:bg-white/[0.05]",
  }[variant];
  const s = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-display transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${s} ${className}`}
    />
  );
}

export function Field({
  label, hint, children, className = "",
}: { label: string; hint?: string; children: (id: string) => React.ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-ink-3">{label}</label>
      {children(id)}
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

export function TextInput({
  label, value, onChange, hint, type = "text", placeholder, className, ...rest
}: {
  label: string; value: string | number | null | undefined; onChange: (v: string) => void; hint?: string;
  type?: string; placeholder?: string; className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <input id={id} type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} {...rest} />
      )}
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line px-3 py-2.5">
      <span>
        <span className="block text-sm">{label}</span>
        {hint && <span className="block text-xs text-ink-3">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-5 w-9 shrink-0 rounded-full bg-white/10 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-ink after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent"
      />
    </label>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "ok" | "warn" | "accent" | "danger"; children: React.ReactNode }) {
  const t = {
    neutral: "border-line text-ink-2",
    ok: "border-ok/30 text-ok",
    warn: "border-warn/30 text-warn",
    accent: "border-accent/40 text-accent",
    danger: "border-danger/30 text-danger",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${t}`}>{children}</span>;
}

/** Translation status for a bilingual value, e.g. "✓ TH  ⚠ EN". */
export function TranslationStatus({ th, en }: { th?: string | null; en?: string | null }) {
  const hasTh = Boolean(th?.trim());
  const hasEn = Boolean(en?.trim());
  if (!hasTh && !hasEn) return null;
  return (
    <span className="flex gap-1.5">
      <Badge tone={hasTh ? "ok" : "warn"}>{hasTh ? "✓" : "⚠"} TH</Badge>
      <Badge tone={hasEn ? "ok" : "warn"}>{hasEn ? "✓" : "⚠"} EN{hasEn ? "" : " missing"}</Badge>
    </span>
  );
}
