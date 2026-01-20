"use client";

import { useState } from "react";
import { DossierSidebar } from "./DossierSidebar";
import { DossierHeader } from "./DossierHeader";
import { DocumentVault } from "./DocumentVault";
import { VideoPitchRecorder } from "./VideoPitchRecorder";
import { GuarantorManager } from "./GuarantorManager";
import { GroupManager } from "./GroupManager";
import { RentResume } from "./RentResume";
import { SolvencyCertifier } from "./SolvencyCertifier";
import { RecommendationManager } from "./RecommendationManager";
import { OverviewTab } from "./OverviewTab";
import { TenantCV } from "./cv/TenantCV";
import { ApplicationKanban } from "./ApplicationKanban";
import { AccessLogViewer } from "./AccessLogViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DossierDashboardProps {
    user: any;
    dossier: any;
    documents: any[];
    progress: number;
}

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DossierDashboard({ user, dossier, documents, progress }: DossierDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview");
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingTab, setPendingTab] = useState<string | null>(null);

    const handleTabChange = (tab: string) => {
        if (isDirty && activeTab === "cv") {
            setPendingTab(tab);
            setShowUnsavedDialog(true);
        } else {
            setActiveTab(tab);
        }
    };

    const confirmTabChange = () => {
        if (pendingTab) {
            setActiveTab(pendingTab);
            setIsDirty(false); // Reset dirty state as we are leaving
            setShowUnsavedDialog(false);
            setPendingTab(null);
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-50/50">
            <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                {/* Ensure Overlay is implicitly handled by shadcn, but we boost Content Z-Index */}
                <AlertDialogContent className="z-[100] bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vous avez des modifications en cours dans votre CV. Si vous quittez cette page, elles seront perdues.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmTabChange} className="bg-red-600 hover:bg-red-700">
                            Quitter sans enregistrer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Full width container but with some reasonable max-width for ultra-wide screens */}
            <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-start gap-0 md:gap-8 relative">

                    {/* Sidebar Navigation - Sticky on left */}
                    <DossierSidebar activeTab={activeTab} onTabChange={handleTabChange} />

                    {/* Main Content Area */}
                    <main className="flex-1 w-full min-w-0 space-y-8 pb-20 md:pb-0">

                        {/* Header (Always Visible or part of Overview? User might want it generic) */}
                        {/* Depending on design, Header might be "Overview" specific or Global. 
                        Let's keep the Header global but maybe smaller? 
                        For now, let's put it in the "overview" tab or keep it top.
                        Actually, typical dashboard has a header.
                    */}

                        {/* Content Switcher */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === "overview" && (
                                <div className="space-y-8">
                                    <OverviewTab user={user} dossier={dossier} documents={documents} />
                                </div>
                            )}

                            {activeTab === "cv" && (
                                <TenantCV userId={user.id} onDirtyChange={setIsDirty} />
                            )}

                            {activeTab === "documents" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-900">Mes Documents</h2>
                                        <p className="text-zinc-500">Ajoutez, visualisez et sécurisez vos pièces justificatives.</p>
                                    </div>
                                    <DocumentVault documents={documents} userId={user.id} />
                                </div>
                            )}

                            {activeTab === "guarantors" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-900">Garants</h2>
                                        <p className="text-zinc-500">Gérez vos garants physiques ou organismes (Garantie Visale, etc).</p>
                                    </div>
                                    <GuarantorManager guarantors={dossier?.guarantors || []} dossierId={dossier?.id} />
                                </div>
                            )}

                            {activeTab === "groups" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-900">Mon Groupe</h2>
                                        <p className="text-zinc-500">Gérez votre dossier commun (Couple ou Colocation).</p>
                                    </div>
                                    <GroupManager userId={user.id} dossier={dossier} />
                                </div>
                            )}

                            {activeTab === "videopitch" && (
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-900">Votre Video Pitch</h2>
                                        <p className="text-zinc-500">Présentez-vous en quelques secondes pour faire la différence.</p>
                                    </div>
                                    <VideoPitchRecorder userId={user.id} initialUrl={dossier?.videoPitchUrl} />
                                </div>
                            )}

                            {activeTab === "history" && (
                                <RentResume userId={user.id} payments={dossier?.rentPayments || []} />
                            )}

                            {activeTab === "recommendations" && (
                                <RecommendationManager userId={user.id} recommendations={dossier?.recommendations || []} />
                            )}

                            {activeTab === "applications" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-900">Mes Candidatures</h2>
                                        <p className="text-zinc-500">Suivez l'état d'avancement de vos dossiers envoyés.</p>
                                    </div>
                                    <ApplicationKanban userId={user.id} />
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-900">Sécurité & Accès</h2>
                                        <p className="text-zinc-500">Contrôlez qui a vu votre dossier et révoquez les accès.</p>
                                    </div>
                                    <AccessLogViewer userId={user.id} />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

