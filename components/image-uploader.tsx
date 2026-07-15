"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  formatBytes,
  MAX_UPLOAD_BYTES,
  validateImageFile,
} from "@/lib/upload";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  className?: string;
};

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 6,
  label = "Завантажити зображення",
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const files = Array.from(fileList);
    const limit = multiple ? maxFiles : 1;
    const remaining = Math.max(0, limit - value.length);
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.message(`Можна додати ще ${remaining} файл(ів)`);
    }

    for (const file of toUpload) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      setUploading(true);
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });

        onChange(multiple ? [...value, blob.url] : [blob.url]);
        toast.success("Зображення завантажено");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Не вдалося завантажити"
        );
      } finally {
        setUploading(false);
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const canAdd = multiple ? value.length < maxFiles : value.length === 0;

  return (
    <div className={cn("space-y-3", className)}>
      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, index) => (
            <li
              key={url}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/70 bg-muted"
            >
              <Image
                src={url}
                alt={`Зображення ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
                unoptimized={url.includes("blob.vercel-storage.com")}
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 size-8 opacity-90 shadow-sm"
                onClick={() => removeAt(index)}
                aria-label="Видалити зображення"
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {canAdd ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={multiple}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {uploading ? "Завантаження…" : label}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            JPG, PNG, WebP або GIF · до {formatBytes(MAX_UPLOAD_BYTES)}
            {multiple ? ` · максимум ${maxFiles}` : null}
          </p>
        </div>
      ) : null}
    </div>
  );
}
