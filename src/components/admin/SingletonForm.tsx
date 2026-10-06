"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSingleton } from "@/app/admin/actions";
import { BilingualField } from "./BilingualField";
import { MediaInput } from "./MediaInput";
import { useToast } from "./toast";
import { Button, Card, Field, inputCls, TextInput, Toggle } from "./ui";

export type SingletonField =
  | { kind: "bilingual"; name: string; label: string; multiline?: boolean; rows?: number; hint?: string }
  | { kind: "text"; name: string; label: string; type?: string; placeholder?: string; hint?: string }
  | { kind: "toggle"; name: string; label: string; hint?: string }
  | { kind: "media"; name: string; label: string; media: "image" | "pdf"; hint?: string; aspect?: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: "color"; name: string; label: string; hint?: string };

export type SingletonGroup = { title: string; description?: string; columns?: 1 | 2; fields: SingletonField[] };

/** Edits the single row of `profile` or `site_settings`, grouped into cards. */
export function SingletonForm({
  table,
  initial,
  groups,
}: {
  table: "profile" | "site_settings";
  initial: Record<string, unknown>;
  groups: SingletonGroup[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const set = (key: string, value: unknown) => {
    setV((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const save = () =>
    start(async () => {
      const res = await saveSingleton(table, v);
      if (!res.ok) return toast(res.error, "error");
      setDirty(false);
      toast("Saved — live on the site");
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-6 pb-24">
      {groups.map((g) => (
        <Card key={g.title} title={g.title} description={g.description}>
          <div className={`grid gap-5 ${g.columns === 2 ? "md:grid-cols-2" : ""}`}>
            {g.fields.map((f) => {
              switch (f.kind) {
                case "bilingual":
                  return <div key={f.name} className={g.columns === 2 ? "md:col-span-2" : ""}><BilingualField label={f.label} name={f.name} values={v} onChange={set} multiline={f.multiline} rows={f.rows} hint={f.hint} /></div>;
                case "text":
                  return <TextInput key={f.name} label={f.label} type={f.type} placeholder={f.placeholder} hint={f.hint} value={v[f.name] as string} onChange={(x) => set(f.name, x)} />;
                case "toggle":
                  return <Toggle key={f.name} label={f.label} hint={f.hint} checked={Boolean(v[f.name])} onChange={(x) => set(f.name, x)} />;
                case "media":
                  return <MediaInput key={f.name} label={f.label} hint={f.hint} kind={f.media} aspect={f.aspect} value={v[f.name] as string} onChange={(u) => set(f.name, u)} folder={table} />;
                case "color":
                  return (
                    <Field key={f.name} label={f.label} hint={f.hint}>
                      {(id) => (
                        <div className="flex items-center gap-3">
                          <input id={id} type="color" value={(v[f.name] as string) || "#3b6bff"} onChange={(e) => set(f.name, e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-transparent" />
                          <input aria-label={`${f.label} hex`} value={(v[f.name] as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className={`${inputCls} max-w-32 font-mono`} />
                        </div>
                      )}
                    </Field>
                  );
                case "select":
                  return (
                    <Field key={f.name} label={f.label}>
                      {(id) => (
                        <select id={id} value={(v[f.name] as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className={inputCls}>
                          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      )}
                    </Field>
                  );
              }
            })}
          </div>
        </Card>
      ))}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[#040612] lg:left-[240px]">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-8">
          {dirty && <span className="text-xs text-ink-3">Unsaved changes</span>}
          <Button variant="primary" onClick={save} disabled={pending || !dirty}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}
