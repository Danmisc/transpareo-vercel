"use client";

import { useState, useEffect } from "react";
import { getFinancialStats } from "@/lib/actions-owner";
import { FinancialCockpit } from "./financials/FinancialCockpit";

export function OwnerFinancials() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFinancialStats("ALL").then((res) => {
            if (res.success) {
                setData(res.data);
            }
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="flex h-[400px] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600"></div>
                <div className="text-sm text-zinc-500 animate-pulse">Chargement de la Suite Financière...</div>
            </div>
        </div>
    );

    if (!data) return <div className="p-10 text-center text-red-500">Erreur de chargement des données.</div>;

    return (
        <div className="space-y-6">
            <FinancialCockpit data={data} />
        </div>
    );
}
