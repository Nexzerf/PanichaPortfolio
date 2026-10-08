"use client";
import { useEffect, useRef, useState } from "react";
import { driveFileId, isVideoFile } from "@/lib/site";
import { uploadMedia } from "@/lib/upload";
import { useToast } from "./toast";
import { Button } from "./ui";

/** A same-origin / CORS-enabled URL the browser can decode frame-by-frame, or null. Drive goes through our owner-only proxy. */
function playableSource(url: string | null | undefined): string | null {
  if (!url) return null;
  const drive = driveFileId(url);
  if (drive) return `/api/admin/drive-video?id=${drive}`;
  if (isVideoFile(url)) return url;
  return null;
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}.${String(Math.floor((t % 1) * 10))}`;

/**
 * Pick any moment of the project's video as its cover: scrub to a frame, then it is captured
 * to an image, uploaded, and set as the thumbnail. Works with Google Drive links and MP4s;
 * for anything else (or Drive files too large to stream) the owner can open the clip from their computer.
 */
export function FramePicker({
  videoUrl,
  folder,
  onPicked,
}: {
  videoUrl: string | null | undefined;
  folder: string;
  onPicked: (url: string) => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const start = () => {
    setFailed(false);
    setDuration(0);
    setTime(0);
    setSrc(playableSource(videoUrl));
    setOpen(true);
  };

  useEffect(() => () => {
    if (localUrl) URL.revokeObjectURL(localUrl);
  }, [localUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openLocal = (file: File | undefined) => {
    if (!file) return;
    if (localUrl) URL.revokeObjectURL(localUrl);
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    setSrc(url);
    setFailed(false);
    setDuration(0);
    setTime(0);
  };

  const seek = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = Math.max(0, Math.min(duration || 0, t));
  };

  const capture = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    setBusy(true);
    try {
      const scale = Math.min(1, 1920 / Math.max(v.videoWidth, v.videoHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(v.videoWidth * scale);
      canvas.height = Math.round(v.videoHeight * scale);
      canvas.getContext("2d")!.drawImage(v, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
      if (!blob) throw new Error("Could not capture this frame");
      const up = await uploadMedia(new File([blob], "cover.jpg", { type: "image/jpeg" }), `${folder}/covers`);
      onPicked(up.url);
      toast("ตั้งเป็นภาพปกแล้ว — อย่าลืมกด Save");
      setOpen(false);
    } catch (e) {
      const blocked = e instanceof DOMException && e.name === "SecurityError";
      toast(blocked ? "จับภาพจากลิงก์นี้ไม่ได้ — กด “เปิดคลิปจากเครื่อง” แทน" : e instanceof Error ? e.message : "Capture failed", "error");
      if (blocked) setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={start}>🎞 เลือกภาพปกจากคลิป</Button>
      <input ref={fileRef} type="file" accept="video/*" className="sr-only" tabIndex={-1} onChange={(e) => { openLocal(e.target.files?.[0]); e.target.value = ""; }} />

      {open && (
        <div role="dialog" aria-modal="true" aria-label="เลือกภาพปกจากคลิป" className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4" onClick={() => setOpen(false)}>
          <div className="flex max-h-full w-full max-w-3xl flex-col gap-4 overflow-auto rounded-2xl border border-line bg-[#070b1f] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg">เลือกท่อนในคลิปเป็นภาพปก</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิด" className="rounded-full px-2 text-ink-2 hover:text-ink">✕</button>
            </div>

            {src && !failed ? (
              <>
                <div className="relative grid place-items-center overflow-hidden rounded-xl bg-black">
                  <video
                    key={src}
                    ref={videoRef}
                    src={src}
                    crossOrigin={/^https?:/.test(src) ? "anonymous" : undefined}
                    muted
                    playsInline
                    preload="auto"
                    className="max-h-[55svh] w-auto max-w-full"
                    onLoadedMetadata={(e) => {
                      setDuration(e.currentTarget.duration || 0);
                      e.currentTarget.currentTime = Math.min(1, (e.currentTarget.duration || 0) / 3);
                    }}
                    onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                    onSeeked={(e) => setTime(e.currentTarget.currentTime)}
                    onError={() => setFailed(true)}
                  />
                  {!duration && <p className="absolute text-sm text-ink-2">กำลังโหลดคลิป…</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="range"
                    aria-label="ตำแหน่งในคลิป"
                    min={0}
                    max={duration || 0}
                    step={0.04}
                    value={time}
                    disabled={!duration}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="w-full accent-[var(--accent)]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-2">
                    <span className="font-mono">{fmt(time)} / {fmt(duration)}</span>
                    <span className="flex gap-1">
                      <Button size="sm" variant="subtle" disabled={!duration} onClick={() => seek(time - 1)}>−1s</Button>
                      <Button size="sm" variant="subtle" disabled={!duration} onClick={() => seek(time - 1 / 30)}>◀ เฟรม</Button>
                      <Button size="sm" variant="subtle" disabled={!duration} onClick={() => seek(time + 1 / 30)}>เฟรม ▶</Button>
                      <Button size="sm" variant="subtle" disabled={!duration} onClick={() => seek(time + 1)}>+1s</Button>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-2">
                {failed
                  ? "โหลดคลิปจากลิงก์นี้มาจับภาพไม่ได้ (ไฟล์ใน Drive อาจใหญ่เกินไป หรือไม่ได้แชร์แบบ Anyone with the link)"
                  : "ลิงก์วิดีโอนี้ (เช่น YouTube) ดึงมาจับภาพไม่ได้"}
                <br />
                เปิดไฟล์คลิปต้นฉบับจากเครื่องแทนได้ — ไฟล์จะไม่ถูกอัปโหลด ระบบจับเฉพาะภาพเฟรมที่เลือก
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button size="sm" variant="subtle" onClick={() => fileRef.current?.click()}>📁 เปิดคลิปจากเครื่อง</Button>
              <Button variant="primary" disabled={!src || failed || !duration || busy} onClick={capture}>
                {busy ? "กำลังบันทึก…" : "ใช้ภาพนี้เป็นปก"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
