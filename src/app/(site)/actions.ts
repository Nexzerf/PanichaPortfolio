"use server";
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LANG_COOKIE } from "@/lib/i18n/server";

export async function setLanguage(lang: "th" | "en") {
  if (lang !== "th" && lang !== "en") return;
  (await cookies()).set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  message: z.string().trim().min(5).max(5000),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactState = { status: "idle" | "ok" | "invalid" | "rate_limited" | "error" };

export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    message: form.get("message"),
    website: form.get("website") ?? "",
  });
  if (!parsed.success) {
    // Bots that fill the honeypot get a fake success.
    return { status: form.get("website") ? "ok" : "invalid" };
  }
  if (!isSupabaseConfigured) return { status: "error" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256")
    .update(`${ip}:${process.env.CONTACT_HASH_SALT ?? "portfolio"}`)
    .digest("hex");

  const { name, email, message } = parsed.data;
  const { data, error } = await createPublicClient().rpc("submit_contact_message", {
    p_name: name,
    p_email: email,
    p_message: message,
    p_ip_hash: ipHash,
  });
  if (error) return { status: "error" };
  if (data === "rate_limited") return { status: "rate_limited" };
  if (data !== "ok") return { status: "invalid" };

  await notifyOwner({ name, email, message }).catch(() => {
    // The message is already stored in Admin › Contact; email is a best-effort extra.
  });
  return { status: "ok" };
}

/** Optional email notification through Resend when RESEND_API_KEY and CONTACT_NOTIFY_EMAIL are set. */
async function notifyOwner(msg: { name: string; email: string; message: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: msg.email,
      subject: `New message from ${msg.name}`,
      text: `${msg.name} <${msg.email}>\n\n${msg.message}`,
    }),
  });
}
