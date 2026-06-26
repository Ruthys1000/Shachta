"use client";

import { useRef, useState } from "react";
import { ImagePlus, ScanText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { compressImageToBase64, type CompressedImage } from "@/lib/image";

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function ImageUploadForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (images: CompressedImage[]) => void;
  loading: boolean;
  error?: string;
}) {
  const [images, setImages] = useState<PendingImage[]>([]);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  }

  async function handleSubmit() {
    setCompressing(true);
    try {
      const compressed = await Promise.all(images.map((img) => compressImageToBase64(img.file)));
      onSubmit(compressed);
    } finally {
      setCompressing(false);
    }
  }

  const busy = compressing || loading;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        צלמ/י או בחר/י את עמודי השיעור (כמה תמונות, לפי הסדר שבו הם מופיעים בספר). ה-AI יקרא
        אותם וילווה אותך בלמידה.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        id="lesson-image-input"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <label
        htmlFor="lesson-image-input"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center transition hover:bg-muted-soft"
      >
        <ImagePlus className="size-8 text-muted" />
        <span className="text-sm font-medium">הוספת תמונות עמודים</span>
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, index) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt={`עמוד ${index + 1}`} className="size-full object-cover" />
              <button
                onClick={() => handleRemove(img.id)}
                aria-label="הסרת תמונה"
                className="absolute left-1 top-1 rounded-full bg-black/60 p-1 text-white"
              >
                <Trash2 className="size-3.5" />
              </button>
              <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5 text-xs text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        icon={busy ? undefined : ScanText}
        onClick={handleSubmit}
        loading={busy}
        disabled={images.length === 0}
        className="self-end"
      >
        {compressing ? "מכין תמונות..." : "ניתוח השיעור"}
      </Button>
      {loading && !compressing && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          <Spinner className="size-4" />
          ה-AI קורא את השיעור...
        </div>
      )}
    </div>
  );
}
