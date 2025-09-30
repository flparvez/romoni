"use client";

import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface FileUploadProps {
  /** Preloaded images (e.g., edit mode) */
  initialImages?: string[];
  /** Fires only when images are ADDED (after successful upload) or REMOVED via the remove button */
  onChange?: (images: string[]) => void;
  /** Optional: accept filter like "image/*" */
  accept?: string;
  /** Optional: disable input/button */
  disabled?: boolean;
}

type ProgressMap = Record<string, number>;

const FileUpload: React.FC<FileUploadProps> = ({
  initialImages = [],
  onChange,
  accept = "image/*",
  disabled = false,
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchAbortRef = useRef<AbortController | null>(null);

  /** Keep local state in sync when initialImages actually changes */
  useEffect(() => {
    setUploadedImages((prev) => {
      // Prevent accidental removal: only replace if different
      const same =
        prev.length === initialImages.length &&
        prev.every((v, i) => v === initialImages[i]);
      return same ? prev : [...initialImages];
    });
  }, [initialImages]);

  // Auth function for ImageKit
  const authenticator = useCallback(async () => {
    const res = await fetch("/api/auth/imagekit-auth");
    if (!res.ok) throw new Error("Auth request failed");
    return res.json() as Promise<{
      signature: string;
      expire: number;
      token: string;
      publicKey: string;
    }>;
  }, []);

  const resetProgress = () => setProgress({});

  const handleUpload = useCallback(async () => {
    const input = fileInputRef.current;
    if (!input?.files?.length) {
      alert("Please select at least one image.");
      return;
    }
    const files = Array.from(input.files);

    // Prepare batch
    setUploading(true);
    resetProgress();
    const aborter = new AbortController();
    batchAbortRef.current = aborter;

    try {
      const { signature, expire, token, publicKey } = await authenticator();

      // Upload all selected files concurrently; collect successful URLs
      const results = await Promise.allSettled(
        files.map((file) =>
          upload({
            expire,
            token,
            signature,
            publicKey,
            file,
            fileName: `${Date.now()}-${file.name}`,
            onProgress: (evt) => {
              setProgress((prev) => ({
                ...prev,
                [file.name]: Math.round((evt.loaded * 100) / evt.total),
              }));
            },
            abortSignal: aborter.signal,
          })
        )
      );

      const newUrls: string[] = [];
      results.forEach((r, idx) => {
        if (r.status === "fulfilled" && r.value?.url) {
          newUrls.push(r.value.url);
        } else if (r.status === "rejected") {
          const err = r.reason;
          // Friendly errors, but DO NOT remove any existing images.
          if (err instanceof ImageKitAbortError) {
            console.warn(`Upload aborted: ${files[idx].name}`);
          } else if (err instanceof ImageKitInvalidRequestError) {
            console.error(`Invalid request: ${err.message}`);
          } else if (err instanceof ImageKitUploadNetworkError) {
            console.error(`Network error: ${err.message}`);
          } else if (err instanceof ImageKitServerError) {
            console.error(`Server error: ${err.message}`);
          } else {
            console.error("Unknown upload error:", err);
          }
        }
      });

      if (newUrls.length > 0) {
        // Atomic append: never remove existing images here
        setUploadedImages((prev) => {
          // Avoid duplicates
          const dedup = new Set([...prev, ...newUrls]);
          const updated = Array.from(dedup);
          onChange?.(updated); // ✅ only add/append triggers onChange
          return updated;
        });
      }
      // Clear file input after batch
      if (input) input.value = "";
    } finally {
      setUploading(false);
      batchAbortRef.current = null;
    }
  }, [authenticator, onChange]);

  /** Explicit remove (ONLY place that can remove images) */
  const handleRemove = useCallback(
    (url: string) => {
      setUploadedImages((prev) => {
        const updated = prev.filter((u) => u !== url);
        onChange?.(updated); // ✅ removal triggers onChange
        return updated;
      });
    },
    [onChange]
  );

  const handleAbort = useCallback(() => {
    batchAbortRef.current?.abort();
  }, []);

  const hasProgress = useMemo(() => Object.keys(progress).length > 0, [progress]);

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      {/* File input */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled || uploading}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={disabled || uploading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {uploading && (
            <button
              type="button"
              onClick={handleAbort}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {hasProgress && (
        <div className="mt-4 space-y-2">
          {Object.entries(progress).map(([name, value]) => (
            <div key={name} className="text-sm">
              <div className="flex justify-between">
                <span className="truncate max-w-[65%]">{name}</span>
                <span>{value}%</span>
              </div>
              <progress value={value} max={100} className="w-full" />
            </div>
          ))}
        </div>
      )}

      Gallery
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {uploadedImages.map((url) => (
          <div
            key={url}
            className="group relative overflow-hidden rounded-md border"
          >
            <img
              src={url}
              alt="uploaded"
              className="aspect-square w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-2 right-2 rounded bg-red-600/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;
