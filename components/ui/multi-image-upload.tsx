"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, UploadCloud, Plus } from "lucide-react";
import { uploadFiles } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    onRemove: (url: string) => void;
    className?: string;
    accept?: string;
    maxFiles?: number;
    disabled?: boolean;
}

export function MultiImageUpload({
    value = [],
    onChange,
    onRemove,
    className,
    accept = "image/*",
    maxFiles = 4,
    disabled = false
}: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (value.length + files.length > maxFiles) {
            alert(`Maximum ${maxFiles} fichiers autorisés.`);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append("files", file);
        });

        try {
            const res = await uploadFiles(formData);
            if (res.success && res.urls) {
                onChange([...value, ...res.urls]);
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Upload error");
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 gap-4">
                {value.map((url, index) => (
                    <div key={url} className="relative rounded-md overflow-hidden aspect-square bg-muted/50 border group">
                        {url.match(/\.(mp4|webm)$/i) ? (
                            <video src={url} className="object-cover w-full h-full" />
                        ) : (
                            <img src={url} alt="Upload" className="object-cover w-full h-full" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8 rounded-full"
                                onClick={() => onRemove(url)}
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {value.length < maxFiles && (
                    <label className={cn(
                        "flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                        disabled || isUploading ? "pointer-events-none opacity-50" : ""
                    )}>
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            ) : (
                                <>
                                    <Plus className="h-8 w-8 mb-2" />
                                    <p className="text-xs font-semibold">Ajouter</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept={accept}
                            multiple
                            onChange={handleFileChange}
                            disabled={disabled || isUploading}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}

