'use client';

import { useRef, useState, useCallback, DragEvent } from 'react';
import { Camera, FileUp, X, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import type { UploadedFile } from '@/lib/types';

interface UploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

async function compressImage(file: File): Promise<{ data: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const MAX_SIDE = 1200;
      let { width, height } = img;
      if (width > MAX_SIDE || height > MAX_SIDE) {
        const ratio = Math.min(MAX_SIDE / width, MAX_SIDE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      resolve({ data: dataUrl.split(',')[1], previewUrl: dataUrl });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Impossible de lire : ${file.name}`));
    };

    img.src = objectUrl;
  });
}

async function readPdfAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error(`Impossible de lire : ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function UploadZone({ files, onFilesChange, maxFiles = 12 }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const remaining = maxFiles - files.length;

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      const toProcess = rawFiles.slice(0, remaining);
      if (toProcess.length === 0) return;

      const tempIds = toProcess.map(() => crypto.randomUUID());
      setProcessingIds((prev) => new Set([...Array.from(prev), ...tempIds]));

      const results = await Promise.allSettled(
        toProcess.map(async (file, i): Promise<UploadedFile> => {
          const isPdf = file.type === 'application/pdf';
          if (isPdf) {
            const data = await readPdfAsBase64(file);
            return { id: tempIds[i], name: file.name, mimeType: 'application/pdf', data, isImage: false };
          }
          const { data, previewUrl } = await compressImage(file);
          return {
            id: tempIds[i],
            name: file.name,
            mimeType: 'image/jpeg',
            data,
            previewUrl,
            isImage: true,
          };
        }),
      );

      const newFiles: UploadedFile[] = [];
      results.forEach((r) => {
        if (r.status === 'fulfilled') newFiles.push(r.value);
      });

      setProcessingIds((prev) => {
        const next = new Set(prev);
        tempIds.forEach((id) => next.delete(id));
        return next;
      });

      onFilesChange([...files, ...newFiles]);
    },
    [files, onFilesChange, remaining],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const items = Array.from(e.dataTransfer.files).filter((f) =>
      ACCEPTED_TYPES.includes(f.type),
    );
    processFiles(items);
  }

  function removeFile(id: string) {
    const f = files.find((x) => x.id === id);
    if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
    onFilesChange(files.filter((x) => x.id !== id));
  }

  const isProcessing = processingIds.size > 0;

  return (
    <div className="space-y-4">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Drop zone (shown when no files or always on desktop) */}
      {files.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={clsx(
            'relative flex min-h-[220px] flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed p-8 transition-all',
            isDragging
              ? 'border-brick bg-brick/5'
              : 'border-line bg-paper-dark hover:border-ink-soft',
          )}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper shadow-card">
              <FileUp className="h-6 w-6 text-ink-soft" />
            </div>
            <p className="text-sm font-medium text-ink">Glissez vos documents ici</p>
            <p className="text-xs text-ink-soft">JPG, PNG, PDF — max {maxFiles} fichiers</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-ink bg-paper px-4 py-3 text-sm font-medium text-ink transition-all hover:bg-ink hover:text-paper"
            >
              <Camera className="h-4 w-4" />
              Photographier
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-paper transition-all hover:bg-brick"
            >
              <FileUp className="h-4 w-4" />
              Choisir des fichiers
            </button>
          </div>
        </div>
      ) : (
        /* Grid preview */
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={clsx(
              'grid grid-cols-3 gap-2 rounded-xl border p-3 transition-all sm:grid-cols-4',
              isDragging ? 'border-brick bg-brick/5' : 'border-line bg-paper-dark',
            )}
          >
            {files.map((f, idx) => (
              <div key={f.id} className="group relative aspect-square">
                {f.isImage && f.previewUrl ? (
                  <img
                    src={f.previewUrl}
                    alt={f.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg bg-paper p-2 shadow-sm">
                    <FileText className="h-6 w-6 text-ink-soft" />
                    <span className="line-clamp-2 text-center text-[10px] text-ink-soft">
                      {f.name}
                    </span>
                  </div>
                )}
                <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-[10px] font-bold text-paper">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Add more button */}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line bg-paper text-xs text-ink-soft transition-colors hover:border-ink-soft"
              >
                <FileUp className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-ink-soft">
              {files.length} document{files.length > 1 ? 's' : ''} • {remaining} restant{remaining > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={remaining === 0}
                className="flex items-center gap-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
              >
                <Camera className="h-3.5 w-3.5" />
                Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={remaining === 0}
                className="flex items-center gap-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
              >
                <FileUp className="h-3.5 w-3.5" />
                Fichier
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <p className="text-center text-xs text-ink-soft">Compression en cours…</p>
      )}
    </div>
  );
}
