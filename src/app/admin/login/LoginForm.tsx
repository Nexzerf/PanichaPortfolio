"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ next, notOwner }: { next: string; notOwner: boolean }) {
  const [error, setError] = useState(notOwner ? "This account is not an owner of this site." : "");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const supabase = getBrowserClient();
    if (notOwner) await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError("Email or password is incorrect.");
      setPending(false);
      return;
    }
    window.location.assign(next);
  }

  const input =
    "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-ink outline-none transition-colors focus:border-accent";
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-ink-2">
        Email
        <input name="email" type="email" required autoComplete="username" className={input} />
      </label>
      <label className="flex flex-col gap-2 text-sm text-ink-2">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-accent px-6 py-3 font-display text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
