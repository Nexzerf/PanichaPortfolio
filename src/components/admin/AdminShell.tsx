"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/awards", label: "Awards" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ email, unread, children }: { email: string; unread: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-[100svh] bg-[#040612] text-ink lg:grid lg:grid-cols-[240px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[240px] border-r border-line bg-[#060a1c] p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-[100svh] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <Link href="/admin" className="mb-8 flex items-center gap-2 font-display text-sm">
            <span className="grid size-7 place-items-center rounded-full border border-line-strong font-serif italic">P</span>
            Portfolio Admin
          </Link>
          <nav aria-label="Admin">
            <ul className="flex flex-col gap-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={active(n.href) ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      active(n.href) ? "bg-white/[0.07] text-ink" : "text-ink-2 hover:bg-white/[0.04] hover:text-ink"
                    }`}
                  >
                    {n.label}
                    {n.href === "/admin/contact" && unread > 0 && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-white">{unread}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4 text-sm">
            <Link href="/" target="_blank" className="text-ink-2 hover:text-ink">
              View site ↗
            </Link>
            <p className="truncate text-xs text-ink-3" title={email}>
              {email}
            </p>
            <form action={signOut}>
              <button type="submit" className="text-ink-2 hover:text-danger">
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>
      {open && (
        <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <div className="min-w-0">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-[#040612] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-line px-3 py-1.5 text-sm"
          >
            Menu
          </button>
          <span className="font-display text-sm">Portfolio Admin</span>
        </div>
        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
