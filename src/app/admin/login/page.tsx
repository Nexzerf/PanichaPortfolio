import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/Logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const { error, next } = await props.searchParams;
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden px-4">
      <span aria-hidden className="stars" />
      <div className="relative w-full max-w-sm rounded-[24px] border border-line bg-[#070b1f] p-8 shadow-[var(--shadow-glow)]">
        <Logo size={44} className="mb-6" />
        <p className="kicker mb-2">Owner</p>
        <h1 className="mb-8 font-display text-3xl font-light">Sign in</h1>
        {!isSupabaseConfigured ? (
          <p className="text-sm text-warn">
            Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
          </p>
        ) : (
          <LoginForm
            next={typeof next === "string" && next.startsWith("/admin") ? next : "/admin"}
            notOwner={error === "not_owner"}
          />
        )}
      </div>
    </main>
  );
}
