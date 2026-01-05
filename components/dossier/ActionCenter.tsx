"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle, AlertCircle, Zap } from "lucide-react";

export function ActionCenter() {
    // This would be dynamic based on dossier state
    const actions = [
        {
            id: 1,
            title: "Ajoutez un Garant",
            desc: "Augmentez vos chances de 40% en rassurant le propriétaire.",
            points: "+15 pts",
            cta: "Ajouter",
            color: "text-blue-600 bg-blue-50 border-blue-100"
        },
        {
            id: 2,
            title: "Complétez votre CV Locatif",
            desc: "Il manque 2 preuves de paiement de loyer.",
            points: "+10 pts",
            cta: "Compléter",
            color: "text-orange-600 bg-orange-50 border-orange-100"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-current" size={20} /> Action Center
                </h3>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">2 suggestions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map(action => (
                    <div key={action.id} className={`p-5 rounded-2xl border ${action.color} flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-zinc-900">{action.title}</h4>
                                <span className="text-xs font-black bg-white/80 px-2 py-1 rounded-lg shadow-sm border border-transparent/10">
                                    {action.points}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-600 leading-relaxed mb-4">{action.desc}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="w-fit p-0 h-auto font-bold hover:bg-transparent flex items-center gap-1 group">
                            {action.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
