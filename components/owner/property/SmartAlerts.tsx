"use client";

import { AlertTriangle, Clock, ShieldAlert, CheckCircle } from "lucide-react";

export function SmartAlerts({ data }: { data: any }) {
    // Logic to generate alerts based on data
    const alerts = [];

    // 1. Check Lease End
    const activeLease = data.leases.find((l: any) => l.status === 'ACTIVE');
    if (activeLease && activeLease.endDate) {
        const daysRemaining = Math.ceil((new Date(activeLease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 90) {
            alerts.push({
                type: "warning",
                title: "Fin de bail proche",
                desc: `Le bail expire dans ${daysRemaining} jours. Pensez au renouvellement.`,
                icon: <Clock size={16} />
            });
        }
    }

    // 2. Mock Diagnostics Check (Random for demo if no real data)
    // In real app, check `data.diagnostics.expiryDate`
    alerts.push({
        type: "danger",
        title: "Assurance PNO",
        desc: "Attestation manquante pour l'année en cours.",
        icon: <ShieldAlert size={16} />
    });

    if (alerts.length === 0) {
        return (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
                <CheckCircle className="text-emerald-600" size={20} />
                <div>
                    <h4 className="font-bold text-emerald-800 text-sm">Tout est en ordre</h4>
                    <p className="text-emerald-700/80 text-xs mt-0.5">Aucune action requise pour le moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {alerts.map((alert, idx) => (
                <div key={idx} className={`rounded-xl p-4 border flex gap-3 ${alert.type === 'danger'
                        ? 'bg-red-50 border-red-100 text-red-900'
                        : 'bg-amber-50 border-amber-100 text-amber-900'
                    }`}>
                    <div className={`mt-0.5 shrink-0 ${alert.type === 'danger' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                        {alert.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">{alert.title}</h4>
                        <p className={`text-xs mt-1 ${alert.type === 'danger' ? 'text-red-700' : 'text-amber-700'
                            }`}>{alert.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
