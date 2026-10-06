"use client";
import { useActionState, useEffect, useRef } from "react";
import { submitContact, type ContactState } from "@/app/(site)/actions";

export function ContactForm({
  labels,
}: {
  labels: {
    name: string; email: string; message: string; send: string; sending: string;
    sent: string; error: string; rateLimited: string; invalid: string;
  };
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "ok") formRef.current?.reset();
  }, [state]);

  const feedback =
    state.status === "ok" ? labels.sent
    : state.status === "rate_limited" ? labels.rateLimited
    : state.status === "invalid" ? labels.invalid
    : state.status === "error" ? labels.error
    : "";

  const field =
    "peer w-full border-0 border-b border-line-strong bg-transparent px-0 pb-3 pt-7 text-lg text-ink outline-none transition-colors duration-300 placeholder:text-transparent focus:border-accent focus-visible:outline-none";
  const label =
    "pointer-events-none absolute left-0 top-7 text-ink-3 transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:tracking-[0.18em] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:tracking-[0.18em]";

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-8" noValidate={false}>
      <div className="relative">
        <input id="cf-name" name="name" required maxLength={120} autoComplete="name" placeholder=" " className={field} />
        <label htmlFor="cf-name" className={label}>{labels.name}</label>
      </div>
      <div className="relative">
        <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder=" " className={field} />
        <label htmlFor="cf-email" className={label}>{labels.email}</label>
      </div>
      <div className="relative">
        <textarea id="cf-message" name="message" required minLength={5} maxLength={5000} rows={5} placeholder=" " className={`${field} resize-none`} />
        <label htmlFor="cf-message" className={label}>{labels.message}</label>
      </div>
      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-display text-sm font-medium text-white shadow-[0_0_40px_-8px_var(--accent)] transition-[transform,opacity] duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? labels.sending : labels.send}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${state.status === "ok" ? "text-ok" : "text-danger"}`}
        >
          {feedback}
        </p>
      </div>
    </form>
  );
}
