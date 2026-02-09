import { FileUp } from "lucide-react";
import type * as React from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
	id?: string;
	accept?: string;
	multiple?: boolean;
	onFilesSelected?: (files: File[]) => void;
	className?: string;
}

function FileUpload({
	id,
	accept,
	multiple = false,
	onFilesSelected,
	className,
}: FileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [files, setFiles] = useState<File[]>([]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		if (selectedFiles.length > 0) {
			const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles;
			setFiles(newFiles);
			onFilesSelected?.(newFiles);
		}
	};

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const droppedFiles = Array.from(e.dataTransfer.files);
			if (droppedFiles.length > 0) {
				const newFiles = multiple ? [...files, ...droppedFiles] : droppedFiles;
				setFiles(newFiles);
				onFilesSelected?.(newFiles);
			}
		},
		[files, multiple, onFilesSelected],
	);

	const displayText = files.length > 0 ? files[0].name : "Upload File";

	return (
		<div className={cn("space-y-2", className)}>
			<label
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"w-full bg-white text-muted-foreground gap-3 border-2 rounded-md py-12 flex flex-col items-center justify-center cursor-pointer transition-colors",
					isDragging
						? "border-primary bg-primary/5"
						: "border-gray-300 border-dashed hover:border-gray-400",
				)}
			>
				<FileUp className="size-8" />
				<span className="text-sm text-center px-4">{displayText}</span>
				<input
					ref={inputRef}
					id={id}
					type="file"
					accept={accept}
					multiple={multiple}
					onChange={handleFileChange}
					className="hidden"
				/>
			</label>
		</div>
	);
}

export { FileUpload };
