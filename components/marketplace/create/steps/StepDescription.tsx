"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListingFormData } from "../ListingCreationWizard";
import { Switch } from "@/components/ui/switch";

interface StepProps {
    data: ListingFormData;
    update: (data: Partial<ListingFormData>) => void;
    onNext: () => void;
}

export default function StepDescription({ data, update, onNext }: StepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Description & Prix</h1>
                <p className="text-zinc-500">Donnez envie aux futurs acquéreurs/locataires.</p>
            </div>

            {/* PRICE */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-lg">Prix {data.type === 'RENT' ? 'mensuel hors charges' : 'de vente'}</Label>
                    {data.type === 'RENT' && <span className="text-xs font-medium px-2 py-1 bg-zinc-100 rounded">Hors Charges</span>}
                </div>
                <div className="relative">
                    <Input
                        type="number"
                        value={data.price || ""}
                        onChange={(e) => update({ price: parseFloat(e.target.value) })}
                        className="pl-8 text-2xl font-bold h-14"
                        placeholder="0"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">€</span>
                </div>

                {data.price > 0 && data.surface > 0 && (
                    <p className="text-sm text-zinc-400 text-right">
                        Soit {Math.round(data.price / data.surface)} € / m²
                    </p>
                )}

                {data.type === 'RENT' && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-500">Charges mensuelles</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={data.charges || ""}
                                    onChange={(e) => update({ charges: parseFloat(e.target.value) })}
                                    className="pl-6 font-semibold"
                                    placeholder="0"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">€</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-500">Dépôt de garantie</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={data.deposit || ""}
                                    onChange={(e) => update({ deposit: parseFloat(e.target.value) })}
                                    className="pl-6 font-semibold"
                                    placeholder="0"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">€</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TITLE & DESCRIPTION */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Titre de l'annonce</Label>
                    <Input
                        value={data.title}
                        onChange={(e) => update({ title: e.target.value })}
                        placeholder="Ex: Superbe T3 traversant - Quartier Marais"
                        className="h-12 text-lg"
                        maxLength={60}
                    />
                    <p className="text-xs text-right text-zinc-400">{data.title.length}/60 chars</p>
                </div>

                <div className="space-y-2">
                    <Label>Description détaillée</Label>
                    <Textarea
                        value={data.description}
                        onChange={(e) => update({ description: e.target.value })}
                        placeholder="Décrivez les atouts de votre bien, l'environnement, les travaux récents..."
                        className="min-h-[200px] text-base leading-relaxed p-4"
                    />
                </div>
            </div>

            <Button
                onClick={onNext}
                disabled={!data.title || !data.description || !data.price}
                className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
            >
                Suivant
            </Button>
        </div>
    );
}
