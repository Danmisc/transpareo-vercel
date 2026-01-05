"use client";

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Crop, RotateCw, Check, X, Pencil } from "lucide-react";
import getCroppedImg from '@/lib/cropImage'; // We need this utility

interface ImageEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string;
    onSave: (file: File) => void;
}

export function ImageEditor({ open, onOpenChange, imageSrc, onSave }: ImageEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            if (croppedImage) {
                onSave(croppedImage);
                onOpenChange(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 bg-zinc-950 border-zinc-800 text-white overflow-hidden">
                <DialogHeader className="p-4 border-b border-zinc-800">
                    <DialogTitle className="text-sm font-medium">Éditer l'image</DialogTitle>
                </DialogHeader>

                <div className="flex-1 relative bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={undefined} // Free aspect ratio
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                    />
                </div>

                <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium w-12">Zoom</span>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(v) => setZoom(v[0])}
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium w-12">Rotation</span>
                        <Slider
                            value={[rotation]}
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={(v) => setRotation(v[0])}
                            className="flex-1"
                        />
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between sm:justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
                        <X size={18} className="mr-2" /> Annuler
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setRotation((r) => r + 90)} className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
                            <RotateCw size={16} />
                        </Button>
                        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Check size={18} className="mr-2" /> Enregistrer
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
