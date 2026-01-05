"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronRight, FileText, Printer, ChevronLeft } from "lucide-react";

// --- STEPS DEFINITION ---
const STEPS = [
    { id: 1, title: "Propriétaire", icon: CheckCircle2 },
    { id: 2, title: "Locataire", icon: CheckCircle2 },
    { id: 3, title: "Bien", icon: CheckCircle2 },
    { id: 4, title: "Conditions", icon: CheckCircle2 },
    { id: 5, title: "Finalisation", icon: Printer },
];

export function ContractWizard({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        landlordName: "Jean Dupont (Vous)",
        landlordAddress: "12 Rue de la Paix, 75000 Paris",
        tenantName: "",
        propertyType: "Meublé",
        propertyAddress: "",
        rent: "",
        charges: "",
        startDate: "",
        duration: "1"
    });

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        // @ts-ignore
        contentRef: printRef,
        documentTitle: `Bail_${formData.tenantName || 'Locataire'}`,
    });

    const next = () => setStep(s => Math.min(s + 1, 5));
    const back = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="flex flex-col h-[80vh] max-h-[800px]">
            {/* WIZARD HEADER */}
            <div className="flex justify-between items-center mb-8 px-2">
                {STEPS.map((s) => (
                    <div key={s.id} className={`flex items-center ${s.id === 5 ? "" : "flex-1"}`}>
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all
                            ${step >= s.id ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-200 text-zinc-400"}`}>
                            {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                            <span className="absolute -bottom-6 text-[10px] text-zinc-500 font-medium whitespace-nowrap">{s.title}</span>
                        </div>
                        {s.id !== 5 && <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-indigo-600" : "bg-zinc-100"}`} />}
                    </div>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <Label>Qui est le bailleur ?</Label>
                        <Input value={formData.landlordName} onChange={e => setFormData({ ...formData, landlordName: e.target.value })} placeholder="Nom Prénom" />
                        <Input value={formData.landlordAddress} onChange={e => setFormData({ ...formData, landlordAddress: e.target.value })} placeholder="Adresse" />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <Label>Qui est le locataire ?</Label>
                        <Input value={formData.tenantName} onChange={e => setFormData({ ...formData, tenantName: e.target.value })} placeholder="Nom Prénom du Locataire" autoFocus />
                        <div className="bg-amber-50 p-3 rounded-lg text-amber-700 text-xs flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5" />
                            Pensez à vérifier la pièce d'identité et les justificatifs de revenus avant de signer.
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <Label>Quel bien est loué ?</Label>
                        <Input value={formData.propertyAddress} onChange={e => setFormData({ ...formData, propertyAddress: e.target.value })} placeholder="Adresse du bien" />
                        <Select onValueChange={v => setFormData({ ...formData, propertyType: v })} defaultValue={formData.propertyType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Type de bail" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Meublé">Logement Meublé (1 an)</SelectItem>
                                <SelectItem value="Nu">Logement Vide (3 ans)</SelectItem>
                                <SelectItem value="Mobilité">Bail Mobilité (1-10 mois)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Loyer Hors Charges (€)</Label>
                                <Input type="number" value={formData.rent} onChange={e => setFormData({ ...formData, rent: e.target.value })} placeholder="800" />
                            </div>
                            <div className="space-y-2">
                                <Label>Charges (€)</Label>
                                <Input type="number" value={formData.charges} onChange={e => setFormData({ ...formData, charges: e.target.value })} placeholder="50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Date de début</Label>
                            <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                            <p className="text-xs text-zinc-500">Le bail prendra effet à cette date.</p>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Aperçu du Bail</h3>
                            <Button onClick={() => handlePrint()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                <Printer size={16} /> Imprimer / PDF
                            </Button>
                        </div>

                        {/* PRINTABLE PREVIEW */}
                        <div className="bg-white border text-zinc-900 p-8 shadow-sm text-sm leading-relaxed overflow-hidden rounded-sm" ref={printRef}>
                            <h1 className="text-center font-bold text-xl uppercase mb-6 border-b pb-4">Contrat de Location {formData.propertyType}</h1>

                            <h2 className="font-bold uppercase text-xs text-zinc-500 mb-2">1. Les Parties</h2>
                            <p className="mb-4">
                                <strong>Le Bailleur :</strong> {formData.landlordName}<br />
                                Domicilié à : {formData.landlordAddress}
                            </p>
                            <p className="mb-6">
                                <strong>Le Locataire :</strong> {formData.tenantName || "_________________"}
                            </p>

                            <h2 className="font-bold uppercase text-xs text-zinc-500 mb-2">2. Le Logement</h2>
                            <p className="mb-6">
                                <strong>Adresse :</strong> {formData.propertyAddress || "_________________"}<br />
                                <strong>Destination :</strong> Habitation Principale
                            </p>

                            <h2 className="font-bold uppercase text-xs text-zinc-500 mb-2">3. Conditions Financières</h2>
                            <p className="mb-6">
                                Le loyer mensuel est fixé à <strong>{formData.rent || "___"} €</strong> hors charges.<br />
                                Les provisions sur charges mensuelles sont de <strong>{formData.charges || "___"} €</strong>.<br />
                                Soit un total mensuel de <strong>{parseInt(formData.rent || "0") + parseInt(formData.charges || "0")} €</strong>.
                            </p>

                            <h2 className="font-bold uppercase text-xs text-zinc-500 mb-2">4. Durée</h2>
                            <p className="mb-10">
                                Le bail commence le <strong>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('fr-FR') : "___/___/____"}</strong>.<br />
                                Il est conclu pour une durée de <strong>{formData.propertyType === 'Meublé' ? '1 an' : formData.propertyType === 'Nu' ? '3 ans' : '10 mois'}</strong> renouvelable par tacite reconduction (sauf bail mobilité).
                            </p>

                            <div className="flex justify-between mt-12 pt-8 border-t">
                                <div className="text-center w-1/3">
                                    <p className="mb-12">Le Bailleur<br /><span className="text-[10px] text-zinc-400">(Signature précédée de "Lu et approuvé")</span></p>
                                </div>
                                <div className="text-center w-1/3">
                                    <p className="mb-12">Le Locataire<br /><span className="text-[10px] text-zinc-400">(Signature précédée de "Lu et approuvé")</span></p>
                                </div>
                            </div>

                            <p className="text-[8px] text-zinc-300 mt-8 text-center">Généré certifié par Transpareo Jurist IA.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex justify-between mt-6 pt-4 border-t border-zinc-100">
                {step > 1 ? (
                    <Button variant="ghost" onClick={back} className="gap-2 pl-0 hover:bg-transparent hover:text-indigo-600">
                        <ChevronLeft size={16} /> Retour
                    </Button>
                ) : (
                    <div />
                )}

                {step < 5 ? (
                    <Button onClick={next} className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2">
                        Suivant <ChevronRight size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                )}
            </div>
        </div>
    );
}
