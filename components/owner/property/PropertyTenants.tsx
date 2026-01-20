"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    Calendar,
    CreditCard,
    History,
    FileText,
    CheckCircle2,
    ShieldCheck
} from "lucide-react";
import { InviteTenantDialog } from "../InviteTenantDialog";
import { ReceiptGenerator } from "./ReceiptGenerator";
import { LeaseViewer } from "./LeaseViewer";
import { TenantDossierViewer } from "./TenantDossierViewer";

export function PropertyTenants({ data }: { data: any }) {
    const activeLease = data.leases.find((l: any) => l.status === 'ACTIVE');
    const pastLeases = data.leases.filter((l: any) => l.status !== 'ACTIVE');

    return (
        <div className="space-y-8">

            {/* Active Tenant Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <User className="text-emerald-600" size={20} /> Locataire Actuel
                    </h2>
                    {!activeLease && (
                        <InviteTenantDialog
                            propertyId={data.id}
                            propertyName={data.title}
                            trigger={
                                <Button className="bg-zinc-900 text-white">
                                    + Ajouter un locataire
                                </Button>
                            }
                        />
                    )}
                </div>

                {activeLease ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tenant Profile Card */}
                        <Card className="md:col-span-2 p-6 border-zinc-200/60 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <User size={120} />
                            </div>

                            <div className="flex items-start gap-6 relative">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                                    <AvatarImage src={activeLease.tenant?.avatar} />
                                    <AvatarFallback className="text-xl font-bold bg-zinc-100 text-zinc-500">
                                        {activeLease.tenantName.slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-zinc-900">{activeLease.tenantName}</h3>
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                            Bail En Cours
                                        </Badge>
                                    </div>
                                    <p className="text-zinc-500 flex items-center gap-2 text-sm">
                                        <Mail size={14} /> {activeLease.tenantEmail || "Email non renseigné"}
                                    </p>
                                    <p className="text-zinc-500 flex items-center gap-2 text-sm">
                                        <Calendar size={14} /> Entrée le {new Date(activeLease.startDate).toLocaleDateString()}
                                    </p>

                                    <div className="pt-4 flex gap-3">
                                        <LeaseViewer
                                            data={{
                                                tenantName: activeLease.tenantName,
                                                ownerName: "Agence Transpareo",
                                                address: data.address,
                                                startDate: activeLease.startDate,
                                                endDate: activeLease.endDate,
                                                rentAmount: activeLease.rentAmount,
                                                chargesAmount: activeLease.chargesAmount,
                                                depositAmount: activeLease.rentAmount * 2, // Mock 2 months
                                                duration: 1
                                            }}
                                            trigger={
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <FileText size={14} /> Voir le Bail
                                                </Button>
                                            }
                                        />

                                        <TenantDossierViewer
                                            data={{
                                                tenantName: activeLease.tenantName,
                                                email: activeLease.tenantEmail,
                                                income: activeLease.rentAmount * 3.5, // Mock healthy income
                                                rent: activeLease.rentAmount + activeLease.chargesAmount,
                                                guarantor: true,
                                                jobType: "CDI Cadre", // Mock
                                                documentsStatus: 'VERIFIED'
                                            }}
                                            trigger={
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <ShieldCheck size={14} /> Dossier Locataire
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Payment Stats Card */}
                        <Card className="p-6 border-zinc-200/60 shadow-sm bg-gradient-to-br from-zinc-50 to-white">
                            <h4 className="font-bold text-zinc-700 mb-4 flex items-center gap-2">
                                <CreditCard size={16} /> Paiements
                            </h4>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                                    <span className="text-sm text-zinc-500">Loyer Mensuel</span>
                                    <span className="font-bold text-zinc-900">{activeLease.rentAmount} €</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                                    <span className="text-sm text-zinc-500">Charges</span>
                                    <span className="font-bold text-zinc-900">{activeLease.chargesAmount} €</span>
                                </div>

                                <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-3 border border-emerald-100 mt-2">
                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                    <div>
                                        <p className="text-xs font-bold text-emerald-800">À jour de paiement</p>
                                        <p className="text-[10px] text-emerald-600">Dernier virement le 05/01</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center">
                                <span className="text-xs text-zinc-500 font-medium">Documents</span>
                                <ReceiptGenerator
                                    data={{
                                        tenantName: activeLease.tenantName,
                                        tenantAddress: data.address,
                                        ownerName: "Propriétaire",
                                        propertyAddress: data.address,
                                        period: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                                        paymentDate: new Date().toLocaleDateString(),
                                        rentAmount: activeLease.rentAmount,
                                        chargesAmount: activeLease.chargesAmount,
                                        totalAmount: activeLease.rentAmount + activeLease.chargesAmount
                                    }}
                                    trigger={
                                        <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 font-medium">
                                            <FileText size={14} className="mr-2" />
                                            Quittance
                                        </Button>
                                    }
                                />
                            </div>
                        </Card>
                    </div>
                ) : (
                    <Card className="p-12 border-dashed border-2 border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                            <User size={32} className="text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">Ce bien est vacant</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                            Invitez un locataire pour commencer à suivre les loyers et générer les quittances.
                        </p>
                        <InviteTenantDialog
                            propertyId={data.id}
                            propertyName={data.title}
                            trigger={
                                <Button className="bg-zinc-900 text-white shadow-lg shadow-zinc-900/10">
                                    Inviter un locataire
                                </Button>
                            }
                        />
                    </Card>
                )}
            </section>

            {/* History Section */}
            {pastLeases.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <History size={20} className="text-zinc-400" /> Historique
                    </h2>
                    <div className="space-y-3">
                        {pastLeases.map((lease: any) => (
                            <Card key={lease.id} className="p-4 flex items-center justify-between group hover:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 opacity-70 grayscale">
                                        <AvatarImage src={lease.tenant?.avatar} />
                                        <AvatarFallback>{lease.tenantName.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-zinc-700">{lease.tenantName}</p>
                                        <p className="text-xs text-zinc-400">
                                            {new Date(lease.startDate).toLocaleDateString()} - {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'Fin inconnue'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Détails</Button>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

