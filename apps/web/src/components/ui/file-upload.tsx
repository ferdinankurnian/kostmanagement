import { CheckCircle2, FileUp, X } from "lucide-react";
import type * as React from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  id?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  value?: File[];
  description?: string;
  maxSize?: number;
}

function FileUpload({
  id,
  accept,
  multiple = false,
  onFilesSelected,
  className,
  disabled = false,
  error = false,
  value,
  description = "Format: JPG, PNG, atau PDF (Max. 5MB)",
  maxSize = 5,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);

  const files = value || internalFiles;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles;
      if (!value) setInternalFiles(newFiles);
      onFilesSelected?.(newFiles);
    }
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragging(false);
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        const newFiles = multiple ? [...files, ...droppedFiles] : droppedFiles;
        if (!value) setInternalFiles(newFiles);
        onFilesSelected?.(newFiles);
      }
    },
    [files, multiple, onFilesSelected, disabled, value],
  );

  const removeFile = (index: number) => {
    if (disabled) return;
    const newFiles = files.filter((_, i) => i !== index);
    if (!value) setInternalFiles(newFiles);
    onFilesSelected?.(newFiles);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative w-full bg-white text-muted-foreground gap-3 border-2 rounded-xl py-10 flex flex-col items-center justify-center transition-all",
          disabled
            ? "opacity-60 cursor-not-allowed bg-muted"
            : "cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : error
              ? "border-destructive/50 bg-destructive/5 hover:border-destructive"
              : "border-gray-300 border-dashed hover:border-gray-400 hover:bg-gray-50",
          files.length > 0 &&
            !error &&
            !isDragging &&
            "border-primary/50 bg-primary/5",
        )}
      >
        {files.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="size-10 text-primary" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-foreground text-center px-4 max-w-[250px] truncate">
                {files[0].name}
              </span>
              {files.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  +{files.length - 1} file lainnya
                </span>
              )}
            </div>
            {!disabled && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(0);
                }}
              >
                <X className="size-3" /> Hapus
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <FileUp className="size-8 text-gray-500" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-foreground text-center">
                Klik atau tarik file ke sini
              </span>
              <p className="text-xs text-muted-foreground text-center px-4">
                {description}
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export { FileUpload };
