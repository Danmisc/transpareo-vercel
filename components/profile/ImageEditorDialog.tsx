"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ZoomIn, RotateCw, Check, X, RefreshCw } from "lucide-react";
import getCroppedImg from "@/lib/cropImage";

interface ImageEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    aspectRatio: number; // 1 for avatar, 3 for banner
    onSave: (file: File) => void;
    type: "avatar" | "banner";
}

export function ImageEditorDialog({ isOpen, onClose, imageSrc, aspectRatio, onSave, type }: ImageEditorDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setIsProcessing(true);
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            if (croppedFile) {
                onSave(croppedFile);
            }
        } catch (e) {
            console.error("Error cropping image", e);
        } finally {
            setIsProcessing(false);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden text-zinc-100 sm:rounded-2xl h-[100dvh] sm:h-auto flex flex-col">
                <DialogHeader className="p-4 bg-zinc-900 border-b border-zinc-800 shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <RefreshCw className="w-5 h-5 text-orange-500" />
                        Ajuster l'{type === "avatar" ? "Avatar" : "Bannière"}
                    </DialogTitle>
                </DialogHeader>

                <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[400px]">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape={type === "avatar" ? "round" : "rect"}
                            showGrid={true}
                            objectFit="contain"
                            classes={{
                                containerClassName: "bg-zinc-950",
                                cropAreaClassName: type === "avatar" ? "!border-orange-500/50 !shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]" : "!border-orange-500/50 !shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]"
                            }}
                        />
                    )}
                </div>

                <div className="p-6 bg-zinc-900 space-y-6 shrink-0 z-50">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomIn className="w-4 h-4 text-muted-foreground" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(val) => setZoom(val[0])}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <RotateCw className="w-4 h-4 text-muted-foreground" />
                            <Slider
                                value={[rotation]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={(val) => setRotation(val[0])}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} className="flex-1 border-zinc-700 hover:bg-zinc-800 hover:text-white">
                            <X className="w-4 h-4 mr-2" /> Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isProcessing}
                            className="flex-[2] bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-0"
                        >
                            {isProcessing ? "Traitement..." : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Valider et Appliquer
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
