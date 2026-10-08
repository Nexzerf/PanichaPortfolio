import type { NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Owner-only, same-origin stream of a Google Drive video, used by the admin's cover-frame picker.
 * Serving it from our own origin lets the browser decode it into a <canvas> without CORS issues,
 * and labels it video/mp4 (Drive sends application/octet-stream). Range requests pass through so seeking works.
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return new Response("Not configured", { status: 503 });
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { data: isOwner } = await supabase.rpc("is_owner");
  if (!isOwner) return new Response("Forbidden", { status: 403 });

  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[\w-]{10,}$/.test(id)) return new Response("Bad id", { status: 400 });

  const range = request.headers.get("range");
  const upstream = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download`, {
    headers: range ? { Range: range } : {},
    redirect: "follow",
    cache: "no-store",
  });
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || type.startsWith("text/html")) {
    // Drive answers with an HTML page for private files or files too large to scan.
    return new Response("This Drive file can't be streamed (private or too large)", { status: 422 });
  }

  const headers = new Headers({
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=600",
  });
  for (const h of ["content-length", "content-range"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
