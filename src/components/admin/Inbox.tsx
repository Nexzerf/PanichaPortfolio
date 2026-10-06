"use client";
import { useState, useTransition } from "react";
import { deleteMessage, setMessageRead } from "@/app/admin/actions";
import { useToast } from "./toast";
import { Badge, Button } from "./ui";
import type { ContactMessage } from "@/lib/types";

export function Inbox({ initial }: { initial: ContactMessage[] }) {
  const [items, setItems] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();
  const toast = useToast();

  const toggleRead = (m: ContactMessage, read = !m.read) => {
    setItems((l) => l.map((x) => (x.id === m.id ? { ...x, read } : x)));
    start(async () => {
      const res = await setMessageRead(m.id, read);
      if (!res.ok) toast(res.error, "error");
    });
  };
  const remove = (m: ContactMessage) => {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    setItems((l) => l.filter((x) => x.id !== m.id));
    start(async () => {
      const res = await deleteMessage(m.id);
      toast(res.ok ? "Message deleted" : res.error, res.ok ? "ok" : "error");
    });
  };

  if (items.length === 0) return <p className="text-sm text-ink-3">No messages yet.</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map((m) => {
        const open = openId === m.id;
        return (
          <li key={m.id} className="py-3">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => {
                setOpenId(open ? null : m.id);
                if (!m.read) toggleRead(m, true);
              }}
              className="flex w-full items-center gap-3 text-left"
            >
              <span aria-hidden className={`size-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-accent"}`} />
              <span className={`min-w-0 flex-1 truncate ${m.read ? "text-ink-2" : "font-medium"}`}>
                {m.name} <span className="text-ink-3">— {m.message.slice(0, 80)}</span>
              </span>
              <time className="shrink-0 text-xs text-ink-3" dateTime={m.created_at}>
                {new Date(m.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" })}
              </time>
            </button>
            {open && (
              <div className="mt-3 rounded-xl border border-line bg-white/[0.02] p-4 pl-5">
                <p className="mb-3 text-sm">
                  <a href={`mailto:${encodeURIComponent(m.email)}`} className="text-accent hover:underline">{m.email}</a>
                  {!m.read && <Badge tone="accent">new</Badge>}
                </p>
                {/* Rendered as text — never as HTML */}
                <p className="whitespace-pre-wrap text-sm text-ink-2">{m.message}</p>
                <div className="mt-4 flex gap-2">
                  <a href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent("Re: your message")}`} className="rounded-full bg-accent px-4 py-1.5 text-xs text-white">Reply</a>
                  <Button size="sm" onClick={() => toggleRead(m)}>{m.read ? "Mark unread" : "Mark read"}</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(m)}>Delete</Button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
