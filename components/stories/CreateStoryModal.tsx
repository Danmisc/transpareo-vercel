"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Video, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { createStory } from "@/lib/actions-stories";
import { toast } from "sonner";
import Image from "next/image";

interface CreateStoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateStoryModal({ open, onOpenChange, onSuccess }: CreateStoryModalProps) {
    const [loading, setLoading] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
    const [caption, setCaption] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.startsWith("video/");
        setMediaType(isVideo ? "VIDEO" : "IMAGE");

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setMediaPreview(previewUrl);

        // For demo, using the preview URL (in production, you'd upload to cloud storage)
        setMediaUrl(previewUrl);
    };

    const handleUrlInput = (url: string) => {
        setMediaUrl(url);
        setMediaPreview(url);
        // Guess media type from URL
        if (url.match(/\.(mp4|webm|mov)$/i)) {
            setMediaType("VIDEO");
        } else {
            setMediaType("IMAGE");
        }
    };

    const clearMedia = () => {
        setMediaPreview(null);
        setMediaUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!mediaUrl) {
            toast.error("Veuillez ajouter une image ou vidéo");
            return;
        }

        setLoading(true);
        try {
            const result = await createStory(mediaUrl, mediaType, caption || undefined);

            if (result.success) {
                toast.success("Story publiée! Elle disparaîtra dans 24h.");
                onOpenChange(false);
                clearMedia();
                setCaption("");
                onSuccess?.();
            } else {
                toast.error(result.error || "Erreur lors de la publication");
            }
        } catch (error) {
            toast.error("Erreur lors de la publication");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-orange-500" />
                        Créer une Story
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Media Preview / Upload Zone */}
                    {mediaPreview ? (
                        <div className="relative aspect-[9/16] max-h-[300px] bg-black rounded-xl overflow-hidden">
                            {mediaType === "VIDEO" ? (
                                <video
                                    src={mediaPreview}
                                    className="w-full h-full object-contain"
                                    controls
                                    muted
                                />
                            ) : (
                                <Image
                                    src={mediaPreview}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                />
                            )}
                            <button
                                onClick={clearMedia}
                                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-[9/16] max-h-[300px] border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                        >
                            <div className="flex gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center">
                                    <ImageIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                                    <Video className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-zinc-700 dark:text-zinc-300">Ajouter une photo ou vidéo</p>
                                <p className="text-xs text-zinc-500 mt-1">Cliquez ou glissez-déposez</p>
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* URL Input (alternative) */}
                    <div>
                        <Label className="text-xs text-zinc-500">Ou collez une URL d'image/vidéo</Label>
                        <Input
                            value={mediaUrl}
                            onChange={e => handleUrlInput(e.target.value)}
                            placeholder="https://..."
                            className="mt-1"
                        />
                    </div>

                    {/* Caption */}
                    <div>
                        <Label>Légende (optionnel)</Label>
                        <Textarea
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Ajoutez une légende..."
                            maxLength={200}
                            rows={2}
                        />
                        <p className="text-xs text-zinc-400 mt-1 text-right">{caption.length}/200</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !mediaUrl}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Publier
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

