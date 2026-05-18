import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn, resolveImage } from '../lib/format';
import { useToast } from '../hooks/useToast';

interface ImageUploadProps {
  label?: string;
  currentUrl?: string;
  onFileSelected: (file: File | null) => void;
  aspect?: 'square' | 'wide';
}

const MAX_SIZE = 6 * 1024 * 1024;

export default function ImageUpload({
  label,
  currentUrl,
  onFileSelected,
  aspect = 'wide',
}: ImageUploadProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('That image is larger than the 6MB limit.');
      return;
    }
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    onFileSelected(file);
  };

  const clear = () => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  const shown = preview || resolveImage(currentUrl);
  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-[16/7]';

  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {shown ? (
        <div className={cn('group relative overflow-hidden border border-ink/15 bg-ink/5', aspectClass)}>
          <img src={shown} alt={label || 'Upload preview'} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn btn-sm btn-volt"
            >
              <Upload className="h-3.5 w-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={clear}
              className="btn btn-sm btn-outline-light"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex w-full flex-col items-center justify-center border border-dashed px-6 transition-colors duration-200',
            aspectClass,
            dragging ? 'border-volt bg-volt/5' : 'border-ink/25 bg-ink/[0.02] hover:border-ink/50'
          )}
        >
          <ImageIcon className="h-8 w-8 text-ink/30" />
          <p className="mt-3 text-sm font-semibold text-ink">
            Drag &amp; drop an image, or <span className="text-ink underline">browse</span>
          </p>
          <p className="mt-1 text-xs text-ink/45">JPG, PNG, WEBP or GIF — up to 6MB</p>
        </button>
      )}
    </div>
  );
}
