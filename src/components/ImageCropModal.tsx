'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Modal from './Modal';

const V = 288; // crop viewport (px)
const OUT = 480; // exported image size (px)

interface Props {
  file: File;
  title?: string;
  zoomLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onSave: (blob: Blob) => void | Promise<void>;
}

export default function ImageCropModal({
  file,
  title = 'Adjust Photo',
  zoomLabel = 'Zoom',
  saveLabel = 'Apply',
  cancelLabel = 'Cancel',
  onCancel,
  onSave,
}: Props) {
  const [url, setUrl] = useState('');
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const base = nat ? Math.max(V / nat.w, V / nat.h) : 1;
  const eff = base * zoom;
  const dw = nat ? nat.w * eff : V;
  const dh = nat ? nat.h * eff : V;

  const clampWith = (o: { x: number; y: number }, w: number, h: number) => ({
    x: Math.min(0, Math.max(V - w, o.x)),
    y: Math.min(0, Math.max(V - h, o.y)),
  });

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const b = Math.max(V / w, V / h);
    setNat({ w, h });
    setOffset({ x: (V - w * b) / 2, y: (V - h * b) / 2 });
  }

  function changeZoom(z: number) {
    if (!nat) { setZoom(z); return; }
    const newEff = base * z;
    setOffset((o) => {
      const cx = (-o.x + V / 2) / eff;
      const cy = (-o.y + V / 2) / eff;
      return clampWith({ x: V / 2 - cx * newEff, y: V / 2 - cy * newEff }, nat.w * newEff, nat.h * newEff);
    });
    setZoom(z);
  }

  function onPointerDown(e: ReactPointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!drag.current) return;
    const nx = drag.current.ox + (e.clientX - drag.current.px);
    const ny = drag.current.oy + (e.clientY - drag.current.py);
    setOffset(clampWith({ x: nx, y: ny }, dw, dh));
  }
  function onPointerUp() { drag.current = null; }

  async function save() {
    if (!nat || !imgRef.current) return;
    setSaving(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const srcSize = V / eff;
      ctx.drawImage(imgRef.current, -offset.x / eff, -offset.y / eff, srcSize, srcSize, 0, 0, OUT, OUT);
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), 'image/jpeg', 0.9));
      if (blob) await onSave(blob);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onCancel} title={title} size="sm">
      <div className="space-y-5">
        <div
          className="relative mx-auto cursor-grab touch-none select-none overflow-hidden bg-ink/5 active:cursor-grabbing"
          style={{ width: V, height: V }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={url}
              alt=""
              draggable={false}
              onLoad={onImgLoad}
              style={{ position: 'absolute', left: offset.x, top: offset.y, width: dw, height: dh, maxWidth: 'none' }}
            />
          )}
          {/* circular crop guide — dims everything outside the circle */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 0 9999px rgba(245,245,240,0.72)' }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-ink/30" />
        </div>

        <div>
          <label className="field-label" htmlFor="crop-zoom">{zoomLabel}</label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="w-full accent-ink"
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline-dark flex-1">
            {cancelLabel}
          </button>
          <button type="button" onClick={save} disabled={saving} className="btn btn-volt flex-1 disabled:opacity-50">
            {saving ? '…' : saveLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
