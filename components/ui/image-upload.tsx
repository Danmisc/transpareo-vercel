"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, X, Loader2, UploadCloud } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove: () => void;
    className?: string;
    accept?: string;
    type?: "image" | "video";
}

export function ImageUpload({ value, onChange, onRemove, className, accept = "image/*", type = "image" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadFile(formData);
            if (res.success && res.url) {
                onChange(res.url);
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Upload error");
        } finally {
            setIsUploading(false);
        }
    };

    if (value) {
        return (
            <div className={cn("relative rounded-md overflow-hidden aspect-video bg-muted/50 border", className)}>
                {type === "video" ? (
                    <video src={value} className="object-cover w-full h-full" controls />
                ) : (
                    <img src={value} alt="Upload" className="object-cover w-full h-full" />
                )}
                <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={onRemove}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center justify-center w-full", className)}>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                            <p className="text-xs">Envoi en cours...</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-8 w-8 mb-2" />
                            <p className="text-sm font-semibold">Cliquez pour uploader</p>
                            <p className="text-xs">{type === "video" ? "MP4, WebM (Max 50Mo)" : "PNG, JPG ou GIF"}</p>
                        </>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </label>
        </div>
    );
}

