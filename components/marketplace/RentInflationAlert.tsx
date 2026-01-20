import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface RentInflationAlertProps {
    currentPrice: number;
    estimatedPrice: number; // Based on local aggregate
}

export function RentInflationAlert({ currentPrice, estimatedPrice }: RentInflationAlertProps) {
    if (!currentPrice || !estimatedPrice) return null;

    const diff = currentPrice - estimatedPrice;
    const diffPercent = (diff / estimatedPrice) * 100;

    // Logic: If > 15% higher than estimate -> HIGH INFLATION
    if (diffPercent > 15) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                    <TrendingUp className="text-red-600 h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-bold text-red-900 text-sm">Loyer Surchauffé !</h4>
                    <p className="text-xs text-red-700 mt-1">
                        Ce loyer est <b>{diffPercent.toFixed(0)}% plus cher</b> que la moyenne du quartier constatée par Transpareo ({estimatedPrice}€).
                    </p>
                </div>
            </div>
        );
    }

    // If within range
    return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3">
            <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle className="text-emerald-600 h-5 w-5" />
            </div>
            <div>
                <h4 className="font-bold text-emerald-900 text-sm">Loyer Cohérent</h4>
                <p className="text-xs text-emerald-700 mt-1">
                    Ce prix est dans la moyenne du marché. ({estimatedPrice}€ est. )
                </p>
            </div>
        </div>
    );
}

