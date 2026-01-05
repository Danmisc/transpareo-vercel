"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Download, CheckCircle, Calendar, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface LeaseViewerProps {
    data: {
        tenantName: string;
        ownerName: string; // e.g. "Propriétaire via Transpareo"
        address: string;
        startDate: string;
        endDate?: string;
        rentAmount: number;
        chargesAmount: number;
        depositAmount: number;
        duration: number; // in years
    };
    trigger?: React.ReactNode;
}

export function LeaseViewer({ data, trigger }: LeaseViewerProps) {
    const totalRent = data.rentAmount + data.chargesAmount;

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm" className="gap-2"><FileText size={14} /> Voir le Bail</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 bg-stone-50 overflow-hidden" aria-describedby={undefined}>
                <VisuallyHidden>
                    <DialogTitle>Contrat de Bail : {data.tenantName}</DialogTitle>
                </VisuallyHidden>

                {/* Header Toolbar */}
                <div className="p-4 border-b border-stone-200 bg-white flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FileText className="text-emerald-700" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-800">Bail Numérique Certifié</h3>
                            <p className="text-xs text-stone-500 font-mono">REF-LEASE-{new Date(data.startDate).getFullYear()}-001</p>
                        </div>
                        <Badge variant="outline" className="ml-4 bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                            <CheckCircle size={10} /> Actif
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                            <Printer size={14} /> Imprimer
                        </Button>
                        <Button size="sm" className="gap-2 bg-stone-900 text-white">
                            <Download size={14} /> PDF Signé
                        </Button>
                    </div>
                </div>

                {/* Document Scroll Area */}
                <ScrollArea className="flex-1 p-8 bg-stone-50/50">
                    <div className="max-w-3xl mx-auto bg-white shadow-lg p-12 min-h-[1000px] border border-stone-100 text-stone-800">
                        {/* Title */}
                        <div className="text-center mb-12 pb-8 border-b-2 border-stone-900">
                            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">CONTRAT DE LOCATION</h1>
                            <p className="text-stone-500 uppercase tracking-widest text-sm">Logement Meublé - Loi Alur</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-6 mb-12 p-6 bg-stone-50 rounded-xl border border-stone-100">
                            <div>
                                <p className="text-xs uppercase font-bold text-stone-400 mb-1">Loyer Mensuel</p>
                                <p className="text-xl font-bold font-serif">{totalRent} € <span className="text-xs font-sans font-normal text-stone-500">/mois</span></p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-stone-400 mb-1">Dépôt de Garantie</p>
                                <p className="text-xl font-bold font-serif">{data.depositAmount} €</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-stone-400 mb-1">Durée du bail</p>
                                <p className="text-xl font-bold font-serif">{data.duration} an(s)</p>
                            </div>
                        </div>

                        {/* Clauses */}
                        <div className="space-y-8 font-serif leading-relaxed">
                            <section>
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-sans">1</span>
                                    Désignation des Parties
                                </h4>
                                <div className="pl-8 text-sm space-y-4">
                                    <p>
                                        Entre les soussignés :<br />
                                        <strong>Le Bailleur :</strong> {data.ownerName}, représenté par la plateforme Transpareo.<br />
                                        <strong>Le Locataire :</strong> {data.tenantName}.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-sans">2</span>
                                    Objet du Contrat
                                </h4>
                                <div className="pl-8 text-sm">
                                    <p>
                                        Le Bailleur donne en location au Locataire, qui accepte, les locaux situés à l'adresse suivante :<br />
                                        <strong>{data.address}</strong>.
                                    </p>
                                    <p className="mt-2">
                                        Date de prise d'effet : <strong>{new Date(data.startDate).toLocaleDateString()}</strong>.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-sans">3</span>
                                    Conditions Financières
                                </h4>
                                <div className="pl-8 text-sm">
                                    <p>
                                        Le loyer mensuel est fixé à la somme de <strong>{data.rentAmount} euros</strong>.
                                        Une provision pour charges de <strong>{data.chargesAmount} euros</strong> est ajoutée, soit un total mensuel de <strong>{totalRent} euros</strong>.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Signatures */}
                        <div className="mt-20 pt-10 border-t border-stone-200">
                            <div className="grid grid-cols-2 gap-20">
                                <div>
                                    <p className="text-xs uppercase font-bold text-stone-400 mb-6">Le Bailleur</p>
                                    <div className="h-20 border border-stone-200 bg-stone-50 rounded flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="font-script text-xl font-bold text-stone-800">Signé électroniquement</p>
                                            <p className="text-[10px] text-stone-400">{new Date(data.startDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-stone-400 mb-6">Le Locataire</p>
                                    <div className="h-20 border border-stone-200 bg-stone-50 rounded flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="font-script text-xl font-bold text-stone-800">Signé électroniquement</p>
                                            <p className="text-[10px] text-stone-400">{new Date(data.startDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-100">
                                <ShieldCheck size={14} />
                                Document certifié par Blockchain Transpareo
                            </div>
                        </div>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
