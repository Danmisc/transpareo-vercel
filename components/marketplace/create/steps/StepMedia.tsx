"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ListingFormData } from "../ListingCreationWizard";
import { ImageUpload } from "@/components/ui/image-upload";
import { Maximize2, Video } from "lucide-react";

interface StepProps {
    data: ListingFormData;
    update: (data: Partial<ListingFormData>) => void;
    onNext: () => void;
}

export default function StepMedia({ data, update, onNext }: StepProps) {
    const handleImageAdd = (url: string) => {
        update({ images: [...data.images, url] });
    };

    const handleImageRemove = (url: string) => {
        update({ images: data.images.filter(i => i !== url) });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Photos & Visite 3D</h1>
                <p className="text-zinc-500">Une annonce avec photos est consultée 7x plus souvent !</p>
            </div>

            {/* PHOTOS */}
            <div className="space-y-4">
                <Label className="text-lg">Photos du bien</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group">
                            <img src={url} className="w-full h-full object-cover" alt="Preview" />
                            <button
                                onClick={() => handleImageRemove(url)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                            {idx === 0 && <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Principale</span>}
                        </div>
                    ))}
                    {data.images.length < 10 && (
                        <ImageUpload
                            value=""
                            onChange={handleImageAdd}
                            onRemove={() => { }}
                            className="aspect-square w-full h-full"
                        />
                    )}
                </div>
            </div>

            {/* VIRTUAL TOUR */}
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600">
                        <Maximize2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-purple-900 dark:text-purple-100">Visite Virtuelle 3D</h3>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Compatible Matterport, Klapty, etc.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Input
                        placeholder="Collez le lien de votre visite virtuelle ici..."
                        value={data.virtualTourUrl}
                        onChange={(e) => update({ virtualTourUrl: e.target.value })}
                        className="bg-white border-purple-200 focus:ring-purple-500"
                    />
                    {data.virtualTourUrl && (
                        <div className="mt-2 aspect-video w-full rounded-lg bg-black/5 overflow-hidden">
                            <iframe src={data.virtualTourUrl} className="w-full h-full" />
                        </div>
                    )}
                </div>
            </div>

            <Button onClick={onNext} className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                Suivant
            </Button>
        </div>
    );
}

