"use client";
import { useId, useRef, useState } from "react";
import { ACCEPT, uploadMedia, type Uploaded } from "@/lib/upload";
import { normalizeImageUrl } from "@/lib/site";
import { useToast } from "./toast";
import { inputCls } from "./ui";

/** Upload-or-paste-URL control with a preview. */
export function MediaInput({
  label,
  value,
  onChange,
  folder,
  kind = "image",
  hint,
  aspect = "aspect-video",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string, meta?: Uploaded) => void;
  folder: string;
  kind?: keyof typeof ACCEPT;
  hint?: string;
  aspect?: string;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadMedia(file, folder);
      onChange(res.url, res);
      toast("Uploaded");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isImage = value && !/\.(mp4|pdf)(\?|$)/i.test(value);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-ink-3">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handle(e.dataTransfer.files[0]); }}
        className={`relative grid ${kind === "image" ? aspect : "min-h-24"} place-items-center overflow-hidden rounded-xl border border-dashed transition-colors ${
          dragOver ? "border-accent bg-accent/10" : "border-line-strong bg-white/[0.02]"
        }`}
      >
        {value && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : value ? (
          <a href={value} target="_blank" rel="noreferrer" className="px-4 text-center text-xs text-ink-2 underline">
            {decodeURIComponent(value.split("/").pop() ?? value)}
          </a>
        ) : (
          <p className="px-4 text-center text-xs text-ink-3">Drop a file here or</p>
        )}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-none hover:bg-black"
          >
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="rounded-full bg-black/70 px-3 py-1.5 text-xs text-danger hover:bg-black">
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept={ACCEPT[kind]} className="sr-only" tabIndex={-1} onChange={(e) => handle(e.target.files?.[0])} />
      <input
        id={id}
        type="url"
        value={value ?? ""}
        onChange={(e) => onChange(kind === "image" ? normalizeImageUrl(e.target.value.trim()) : e.target.value)}
        placeholder={kind === "video" ? "…or paste a YouTube / Vimeo / TikTok / Google Drive link" : "…or paste a URL / Google Drive link"}
        className={inputCls}
      />
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  );
}
