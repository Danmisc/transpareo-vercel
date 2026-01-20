"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BedDouble, Bath, Square, MapPin, Euro } from "lucide-react";

interface PropertySheetProps {
    metadata: any; // Ideally typed, but loose for now
    isOpen: boolean;
    onClose: () => void;
}

export function PropertySheet({ metadata, isOpen, onClose }: PropertySheetProps) {
    if (!metadata) return null;

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-h-[85vh]">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-bold flex items-center justify-between">
                            <span>{metadata.price?.toLocaleString()} €</span>
                            <span className="text-sm font-normal bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                {metadata.type || "Appartement"}
                            </span>
                        </DrawerTitle>
                        <DrawerDescription className="flex items-center gap-1">
                            <MapPin size={14} /> {metadata.location || "Localisation non précisée"}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <Square className="mb-2 text-zinc-500" size={20} />
                                <span className="font-bold">{metadata.surface || 0} m²</span>
                                <span className="text-xs text-muted-foreground">Surface</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <BedDouble className="mb-2 text-zinc-500" size={20} />
                                <span className="font-bold">{metadata.rooms || 0}</span>
                                <span className="text-xs text-muted-foreground">Pièces</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <Bath className="mb-2 text-zinc-500" size={20} />
                                <span className="font-bold">{metadata.bedrooms || 0}</span>
                                <span className="text-xs text-muted-foreground">Chambres</span>
                            </div>
                        </div>

                        {/* DPE (If available) */}
                        {metadata.dpe && (
                            <div className="flex items-center gap-4 border p-3 rounded-lg">
                                <span className="text-sm font-medium">DPE</span>
                                <div className="flex gap-1">
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(grade => (
                                        <div key={grade} className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${metadata.dpe === grade ? 'bg-green-500 text-white scale-110' : 'bg-zinc-200 text-zinc-400'}`}>
                                            {grade}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {metadata.description || "Ce bien exceptionnel mérite votre attention. Contactez-nous pour une visite privée."}
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl">
                            Demander une visite
                        </Button>
                        <Button variant="outline" onClick={onClose} className="w-full rounded-xl">
                            Fermer
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

