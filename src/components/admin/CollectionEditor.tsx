"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRow, reorder, saveRow } from "@/app/admin/actions";
import type { SortableTable } from "@/lib/admin";
import { BilingualField } from "./BilingualField";
import { SortableList } from "./Sortable";
import { MediaInput } from "./MediaInput";
import { useToast } from "./toast";
import { Button, Field, inputCls, TextInput, Toggle, TranslationStatus } from "./ui";

type Row = Record<string, unknown> & { id: string };

/** Reads `key`, or `key_th` / `key_en` for bilingual columns. */
function read(row: Row, key: string) {
  const v = row[key] ?? row[`${key}_th`] ?? row[`${key}_en`];
  return v == null ? "" : String(v);
}

export type FieldDef =
  | { kind: "bilingual"; name: string; label: string; multiline?: boolean; rows?: number; hint?: string }
  | { kind: "text"; name: string; label: string; type?: string; placeholder?: string; hint?: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: "toggle"; name: string; label: string; hint?: string }
  | { kind: "media"; name: string; label: string; media: "image" | "pdf"; hint?: string; aspect?: string; folder: string };

/**
 * Generic list editor for simple tables (categories, skills, experience, awards, social links).
 * Rows can be added, edited inline, deleted and reordered by drag & drop.
 */
export function CollectionEditor({
  table,
  rows: initial,
  fields,
  titleKey,
  subtitleKeys,
  statusField,
  defaults = {},
  addLabel = "Add",
  sortable = true,
  indentKey,
  thumbKey,
}: {
  table: SortableTable | "translations";
  rows: Row[];
  fields: FieldDef[];
  /** Column (or bilingual base name) used as the row title. */
  titleKey: string;
  /** Columns (or bilingual base names) joined as the row subtitle. */
  subtitleKeys?: string[];
  statusField?: string;
  defaults?: Record<string, unknown>;
  addLabel?: string;
  sortable?: boolean;
  /** Rows where this column is set are shown indented (e.g. subcategories). */
  indentKey?: string;
  /** Image column shown as a small preview in each row. */
  thumbKey?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [pending, start] = useTransition();

  const open = (row: Row) => {
    setEditing(row.id);
    setDraft({ ...row });
  };
  const add = () => {
    const row = { id: `new-${Date.now()}`, ...defaults } as Row;
    setRows((r) => [...r, row]);
    open(row);
  };
  const cancel = () => {
    if (editing?.startsWith("new-")) setRows((r) => r.filter((x) => x.id !== editing));
    setEditing(null);
    setDraft(null);
  };
  const save = () =>
    start(async () => {
      if (!draft) return;
      const isNew = draft.id.startsWith("new-");
      const res = await saveRow(table, isNew ? null : draft.id, draft);
      if (!res.ok) return toast(res.error, "error");
      const saved = { ...draft, id: res.data?.id ?? draft.id };
      setRows((r) => r.map((x) => (x.id === draft.id ? saved : x)));
      setEditing(null);
      setDraft(null);
      toast("Saved");
      router.refresh();
    });
  const remove = (row: Row) => {
    if (!confirm(`Delete “${titleOf(row) || "this item"}”?`)) return;
    if (row.id.startsWith("new-")) return cancel();
    start(async () => {
      const res = await deleteRow(table, row.id);
      if (!res.ok) return toast(res.error, "error");
      setRows((r) => r.filter((x) => x.id !== row.id));
      toast("Deleted");
    });
  };
  const persistOrder = (next: Row[]) => {
    setRows(next);
    if (table === "translations") return;
    start(async () => {
      const res = await reorder(table, next.filter((r) => !r.id.startsWith("new-")).map((r) => r.id));
      toast(res.ok ? "Order saved" : res.error, res.ok ? "ok" : "error");
    });
  };
  const titleOf = (row: Row) => read(row, titleKey);
  const subtitleOf = subtitleKeys ? (row: Row) => subtitleKeys.map((k) => read(row, k)).filter(Boolean).join(" · ") : null;
  const set = (key: string, value: unknown) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-3">Nothing here yet.</p>}
      <SortableList
        items={rows}
        onReorder={sortable ? persistOrder : () => {}}
        className="flex flex-col gap-2"
        renderItem={(row, handle) =>
          editing === row.id && draft ? (
            <div className="rounded-xl border border-accent/40 bg-[#0a1029] p-4">
              <div className="flex flex-col gap-4">
                {fields.map((f) => {
                  if (f.kind === "bilingual")
                    return <BilingualField key={f.name} label={f.label} name={f.name} values={draft} onChange={set} multiline={f.multiline} rows={f.rows} hint={f.hint} />;
                  if (f.kind === "text")
                    return <TextInput key={f.name} label={f.label} type={f.type} placeholder={f.placeholder} hint={f.hint} value={draft[f.name] as string} onChange={(x) => set(f.name, x)} />;
                  if (f.kind === "media")
                    return <MediaInput key={f.name} label={f.label} hint={f.hint} kind={f.media} aspect={f.aspect} folder={f.folder} value={draft[f.name] as string} onChange={(u) => set(f.name, u)} />;
                  if (f.kind === "toggle")
                    return <Toggle key={f.name} label={f.label} hint={f.hint} checked={Boolean(draft[f.name])} onChange={(x) => set(f.name, x)} />;
                  return (
                    <Field key={f.name} label={f.label}>
                      {(id) => (
                        <select id={id} value={(draft[f.name] as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className={inputCls}>
                          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      )}
                    </Field>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="subtle" onClick={cancel} disabled={pending}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-3 rounded-xl border border-line bg-[#070b1f] p-2 pr-3 ${indentKey && row[indentKey] ? "ml-8" : ""}`}>
              {indentKey && row[indentKey] ? <span aria-hidden className="-ml-1 text-ink-3">↳</span> : null}
              {thumbKey && (
                <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                  {typeof row[thumbKey] === "string" && row[thumbKey] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small admin preview
                    <img src={row[thumbKey] as string} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                </span>
              )}
              {sortable ? handle : <span className="w-2" />}
              <button type="button" onClick={() => open(row)} className="min-w-0 flex-1 text-left">
                <span className="block truncate">{titleOf(row) || <em className="text-ink-3">Untitled</em>}</span>
                {subtitleOf && <span className="block truncate text-xs text-ink-3">{subtitleOf(row)}</span>}
              </button>
              {statusField && <span className="hidden sm:inline"><TranslationStatus th={row[`${statusField}_th`] as string} en={row[`${statusField}_en`] as string} /></span>}
              <Button size="sm" variant="subtle" onClick={() => open(row)} disabled={editing !== null}>Edit</Button>
              <Button size="sm" variant="subtle" onClick={() => remove(row)} className="hover:!text-danger">Delete</Button>
            </div>
          )
        }
      />
      <div>
        <Button onClick={add} disabled={editing !== null}>+ {addLabel}</Button>
      </div>
    </div>
  );
}
