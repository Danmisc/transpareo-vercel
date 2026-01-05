"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, UserCheck, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { sendListingInquiry } from "@/lib/actions/marketplace";
import MortgageSimulator from "../MortgageSimulator";

interface ListingSidebarProps {
    listing: any;
}

export function ListingSidebar({ listing }: ListingSidebarProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.append("listingId", listing.id);

        const result = await sendListingInquiry(formData);

        if (result.success) {
            toast.success("Message envoyé !", {
                description: "L'agence vous recontactera sous 24h."
            });
            (e.target as HTMLFormElement).reset();
        } else {
            toast.error("Erreur", {
                description: result.error || "Impossible d'envoyer le message."
            });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="sticky top-24 space-y-6">
            {/* Main Sticky Card in Glassmorphism */}
            <div className="rounded-3xl border border-white/20 shadow-2xl shadow-orange-900/5 overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 ring-1 ring-black/5">

                {/* Price Header with Orange Gradient Accent */}
                <div className="p-6 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)}
                        </span>
                        {listing.type === 'RENT' && <span className="text-zinc-500 font-medium text-sm">/ mois</span>}
                    </div>
                    {listing.charges && (
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-2">
                            <span className="bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded-full">
                                + {listing.charges} € charges
                            </span>
                        </p>
                    )}
                </div>

                {/* Contact Form */}
                <div className="p-6 pt-4">
                    <form onSubmit={handleContact} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <input name="name" required placeholder="Votre nom" className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-zinc-200/60 dark:border-zinc-800/60 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all focus:bg-white dark:focus:bg-black" />
                            </div>
                            <div className="space-y-1">
                                <input name="phone" placeholder="Téléphone" className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-zinc-200/60 dark:border-zinc-800/60 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all focus:bg-white dark:focus:bg-black" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <textarea
                                name="message"
                                required
                                placeholder={`Bonjour, ce bien m'intéresse...`}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-zinc-200/60 dark:border-zinc-800/60 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none h-28 resize-none transition-all focus:bg-white dark:focus:bg-black"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold h-12 text-base shadow-lg shadow-orange-500/20 rounded-xl transition-all hover:scale-[1.02] border-none"
                        >
                            {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
                        </Button>
                    </form>

                    {/* Phone Button */}
                    {listing.contactPhone && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => toast.info(`Numéro: ${listing.contactPhone}`)}
                                className="text-xs text-zinc-500 hover:text-orange-600 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
                            >
                                <Phone size={12} />
                                Voir le numéro de téléphone
                            </button>
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="mt-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center gap-6 opacity-80">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                            <UserCheck size={14} className="text-orange-500" />
                            <span className="text-xs font-medium">Profil Vérifié</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500">
                            <MessageCircle size={14} className="text-orange-500" />
                            <span className="text-xs font-medium">Réponse rapide</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mortgage Simulator (Keep it separate) */}
            {listing.type === 'SALE' && <MortgageSimulator price={listing.price} />}
        </div>
    );
}
