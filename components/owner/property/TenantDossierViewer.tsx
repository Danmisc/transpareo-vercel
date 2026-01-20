"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, ShieldCheck, Briefcase, Banknote, AlertTriangle, CheckCircle2, FileText, Download, Fingerprint, X, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface TenantDossierProps {
    data: {
        tenantName: string;
        email: string;
        income: number;
        rent: number;
        guarantor: boolean;
        jobType: string;
        documentsStatus: 'VERIFIED' | 'PENDING' | 'MISSING';
    };
    trigger?: React.ReactNode;
}

export function TenantDossierViewer({ data, trigger }: TenantDossierProps) {
    const rentCoverage = (data.income / data.rent).toFixed(1);
    const effortRate = ((data.rent / data.income) * 100).toFixed(0);
    const score = Number(rentCoverage) >= 3 ? 100 : Number(rentCoverage) >= 2.5 ? 80 : 50;

    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<{ title: string; type: string; url?: string } | null>(null);

    const handleDownloadAll = async () => {
        setIsDownloading(true);
        toast.info("Génération du dossier complet...");

        try {
            const { generateFullDossier } = await import('./DocumentGenerator');
            const blob = generateFullDossier(data);
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `Dossier_Complet_${data.tenantName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Dossier téléchargé avec succès");
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la génération");
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePreview = async (doc: { title: string; type: string }) => {
        toast.loading("Ouverture du document...", { id: 'preview-load', duration: 1000 });
        try {
            const { generateDocument } = await import('./DocumentGenerator');
            const blob = generateDocument(doc.type, data);
            const url = URL.createObjectURL(blob);
            setSelectedDoc({ ...doc, url });
            toast.dismiss('preview-load');
        } catch (e) {
            console.error(e);
            toast.error("Impossible de générer le document");
            toast.dismiss('preview-load');
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm" className="gap-2"><ShieldCheck size={14} /> Dossier Locataire</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-zinc-50 border-none h-[600px] flex flex-col focus:outline-none" aria-describedby={undefined}>
                <VisuallyHidden>
                    <DialogTitle>Dossier Locataire : {data.tenantName}</DialogTitle>
                </VisuallyHidden>

                {/* Visual Header */}
                <div className="bg-zinc-900 text-white p-8 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Fingerprint size={200} />
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                                {data.tenantName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{data.tenantName}</h2>
                                <p className="text-zinc-400 flex items-center gap-2 text-sm">
                                    <Briefcase size={14} /> {data.jobType} • {data.income}€ / mois
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-end flex-col">
                                <span className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Score Solvabilité</span>
                                <div className="text-4xl font-bold text-emerald-400">{score}/100</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 flex-1 overflow-hidden relative">

                    {/* Left Sidebar - Key Metrics */}
                    <div className="col-span-1 border-r border-zinc-200 p-6 space-y-8 bg-white overflow-y-auto">
                        <div>
                            <h4 className="text-xs uppercase font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <Banknote size={14} /> Analyse Financière
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-zinc-600">Taux d'effort</span>
                                        <span className={`font-bold ${Number(effortRate) > 35 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {effortRate}%
                                        </span>
                                    </div>
                                    <Progress value={Number(effortRate)} className="h-1.5" indicatorClassName={Number(effortRate) > 35 ? 'bg-red-500' : 'bg-emerald-500'} />
                                    <p className="text-[10px] text-zinc-400 mt-1">Recommandé: &lt; 33%</p>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-zinc-600">Couverture Loyer</span>
                                        <span className="font-bold text-zinc-900">x{rentCoverage}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400">Revenus nets / Loyer CC</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-zinc-200" />

                        <div>
                            <h4 className="text-xs uppercase font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <ShieldCheck size={14} /> Garanties
                            </h4>
                            <div className="space-y-3">
                                <Badge variant="outline" className={`w-full justify-between py-2 ${data.guarantor ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-50 text-zinc-500'}`}>
                                    Garant Physique
                                    {data.guarantor ? <CheckCircle2 size={14} /> : <span className="text-[10px]">Non</span>}
                                </Badge>
                                <Badge variant="outline" className="w-full justify-between py-2 bg-blue-50 text-blue-700 border-blue-200">
                                    Dossier Validé
                                    <CheckCircle2 size={14} />
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Documents */}
                    <div className="col-span-2 p-8 overflow-y-auto bg-stone-50/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-zinc-900">Pièces Justificatives</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-zinc-700 hover:text-zinc-900 border-zinc-300 gap-2"
                                onClick={handleDownloadAll}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <span className="animate-pulse">Génération...</span>
                                ) : (
                                    <>
                                        <Download size={14} /> Tout télécharger
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <DocumentCard
                                title="Carte d'identité"
                                type="Identité"
                                status="VERIFIED"
                                onClick={() => handlePreview({ title: "Carte d'identité", type: "Identité" })}
                            />
                            <DocumentCard
                                title="Contrat de Travail"
                                type="Emploi"
                                status="VERIFIED"
                                onClick={() => handlePreview({ title: "Contrat de Travail", type: "Emploi" })}
                            />
                            <DocumentCard
                                title="3 Derniers Bulletins"
                                type="Revenus"
                                status="VERIFIED"
                                onClick={() => handlePreview({ title: "3 Derniers Bulletins", type: "Revenus" })}
                            />
                            <DocumentCard
                                title="Dernier Avis d'imposition"
                                type="Fiscal"
                                status="VERIFIED"
                                onClick={() => handlePreview({ title: "Dernier Avis d'imposition", type: "Fiscal" })}
                            />
                            {data.guarantor && (
                                <DocumentCard
                                    title="Engagement Caution"
                                    type="Garantie"
                                    status="VERIFIED"
                                    onClick={() => handlePreview({ title: "Engagement Caution", type: "Garantie" })}
                                />
                            )}
                        </div>

                        <div className="mt-8 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm">
                            <h4 className="font-bold text-zinc-900 text-sm mb-2 flex items-center gap-2">
                                <Fingerprint size={16} className="text-blue-600" /> Analyse Transpareo AI
                            </h4>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                Le dossier présente une <strong>excellente solidité financière</strong>. Les revenus sont stables (CDI confirmé) et couvrent largement le loyer (Taux d'effort {effortRate}%). Aucun incident de paiement n'a été détecté dans l'historique bancaire fourni. Le garant physique ajoute une sécurité supplémentaire.
                            </p>
                        </div>
                    </div>

                    {/* Document Preview Overlay */}
                    {selectedDoc && (
                        <div className="absolute inset-0 z-20 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[80%] flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                                    <div>
                                        <h4 className="font-bold text-sm text-zinc-900">{selectedDoc.title}</h4>
                                        <p className="text-[10px] text-zinc-500 uppercase">{selectedDoc.type}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedDoc(null)} className="h-8 w-8">
                                        <X size={16} />
                                    </Button>
                                </div>
                                <div className="flex-1 bg-zinc-100 relative">
                                    {selectedDoc.url ? (
                                        <iframe
                                            src={selectedDoc.url}
                                            className="w-full h-full border-0"
                                            title="Document Preview"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <span className="animate-spin text-zinc-400">Chargement...</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-zinc-100 flex justify-end gap-2 bg-white shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>Fermer</Button>
                                    <Button size="sm" className="bg-zinc-900 text-white" onClick={() => {
                                        if (selectedDoc.url) {
                                            const a = document.createElement('a');
                                            a.href = selectedDoc.url;
                                            a.download = `${selectedDoc.title.replace(/\s+/g, '_')}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            toast.success("Téléchargement lancé");
                                        }
                                    }}>Télécharger</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DocumentCard({ title, type, status, onClick }: { title: string, type: string, status: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="group p-3 rounded-lg border border-zinc-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5 transition-all bg-white cursor-pointer flex items-center justify-between active:scale-[0.99]"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                    <FileText size={16} />
                </div>
                <div>
                    <p className="font-medium text-sm text-zinc-900 group-hover:text-blue-700 transition-colors">{title}</p>
                    <p className="text-[10px] text-zinc-400 uppercase">{type}</p>
                </div>
            </div>
            {status === 'VERIFIED' && (
                <div className="text-emerald-500 bg-emerald-50 rounded-full p-1 group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 size={14} />
                </div>
            )}
        </div>
    )
}

