"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Briefcase, Share2, Download, ShieldCheck, Gem } from "lucide-react";
import { toast } from "sonner";

interface TenantIdentityCardProps {
    user: any;
    dossier: any;
}

export function TenantIdentityCard({ user, dossier }: TenantIdentityCardProps) {
    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/dossier/share/${dossier?.id || "demo"}`);
        toast.success("Lien copié !");
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="flex-shrink-0 relative group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
                        <Avatar className="w-full h-full border-4 border-white">
                            <AvatarImage src={user.image} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold text-orange-600 bg-orange-50">
                                {user.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full border-4 border-white shadow-sm flex items-center gap-1">
                        <ShieldCheck size={12} /> VÉRIFIÉ
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{user.name}</h1>
                            {dossier?.verifiedIncome && (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
                                    <CheckCircle size={12} className="mr-1" /> Revenus Certifiés
                                </Badge>
                            )}
                            {dossier?.profile?.status === "CDI" && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">
                                    <ShieldCheck size={12} className="mr-1" /> CDI Validé
                                </Badge>
                            )}
                        </div>

                        {/* Dynamic Bio / Job */}
                        <p className="text-zinc-500 font-medium mt-1 flex flex-wrap items-center gap-2">
                            <Briefcase size={16} className="text-zinc-400" />
                            {dossier?.profile?.jobTitle ? (
                                <span>{dossier.profile.jobTitle} chez <span className="text-zinc-900 font-semibold">{dossier.profile.employer}</span></span>
                            ) : (
                                "Poste non renseigné"
                            )}
                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-300 mx-2" />
                            <MapPin size={16} className="text-zinc-400" /> {dossier?.profile?.currentAddress ? dossier.profile.currentAddress.split(',')[0] : (dossier?.location || "Lieu inconnu")}
                        </p>

                        {/* Pitch if available */}
                        {dossier?.profile?.bio && (
                            <p className="text-sm text-zinc-600 mt-2 italic border-l-2 border-orange-200 pl-3 py-1">
                                "{dossier.profile.bio}"
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                            <span className="block text-xs text-zinc-400 uppercase font-bold tracking-wider">Revenus Net</span>
                            <span className="font-bold text-zinc-900 text-lg">
                                {dossier?.profile?.netIncome ? `${dossier.profile.netIncome}€` : (dossier?.verifiedIncome ? `${dossier.verifiedIncome}€` : "-")}
                            </span>
                        </div>
                        <div className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                            <span className="block text-xs text-zinc-400 uppercase font-bold tracking-wider">Garanties</span>
                            {/* Check guarantors array length safely */}
                            <span className="font-bold text-zinc-900 text-lg">
                                {dossier?.guarantors?.length > 0 ? `${dossier.guarantors.length} Actif(s)` : "Aucun"}
                            </span>
                        </div>
                        {dossier?.profile?.moveInDate && (
                            <div className="px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
                                <span className="block text-xs text-orange-400 uppercase font-bold tracking-wider">Dispo</span>
                                <span className="font-bold text-orange-900 text-lg">
                                    {new Date(dossier.profile.moveInDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <Button onClick={handleShare} className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 px-6">
                            Partager mon dossier <Share2 size={16} className="ml-2" />
                        </Button>
                        <Button variant="outline" className="rounded-full border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                            <Download size={16} className="mr-2" /> PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

