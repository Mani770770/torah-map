import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Move, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  src: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void | Promise<void>;
  size?: number; // output size in px
}

const BOX = 260; // preview circle size

export function AvatarCropper({ src, onCancel, onSave, size = 320 }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => { setImg(image); setZoom(1); setOffset({ x: 0, y: 0 }); };
    image.src = src;
  }, [src]);

  // base scale = cover the circle
  const base = img ? Math.max(BOX / img.width, BOX / img.height) : 1;
  const scale = base * zoom;

  const clamp = useCallback((o: { x: number; y: number }) => {
    if (!img) return o;
    const w = img.width * scale;
    const h = img.height * scale;
    const maxX = Math.max(0, (w - BOX) / 2);
    const maxY = Math.max(0, (h - BOX) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, o.x)),
      y: Math.min(maxY, Math.max(-maxY, o.y)),
    };
  }, [img, scale]);

  useEffect(() => { setOffset(o => clamp(o)); }, [clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const d = drag.current;
    setOffset(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }));
  };
  const onPointerUp = () => { drag.current = null; };

  const save = async () => {
    if (!img) return;
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const k = size / BOX;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      const w = img.width * scale * k;
      const h = img.height * scale * k;
      ctx.drawImage(img, size / 2 - w / 2 + offset.x * k, size / 2 - h / 2 + offset.y * k, w, h);
      await onSave(canvas.toDataURL("image/jpeg", 0.9));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-foreground">כיוון תמונת הפרופיל</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Move className="h-3.5 w-3.5" /> גררו את התמונה למיקום הרצוי והתאימו את הזום
        </p>

        <div
          className="mx-auto mt-4 touch-none overflow-hidden rounded-full border-4 border-primary/20 bg-muted"
          style={{ width: BOX, height: BOX, cursor: drag.current ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {img ? (
            <div className="flex h-full w-full items-center justify-center">
              <img
                src={src}
                alt="עריכת תמונה"
                draggable={false}
                style={{
                  width: img.width * scale,
                  height: img.height * scale,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                  maxWidth: "none",
                }}
                className="select-none"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3" dir="ltr">
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            aria-label="זום"
          />
        </div>

        <div className="mt-5 flex gap-2">
          <Button onClick={save} disabled={!img || saving} className="flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            שמירת התמונה
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving}>ביטול</Button>
        </div>
      </div>
    </div>
  );
}
