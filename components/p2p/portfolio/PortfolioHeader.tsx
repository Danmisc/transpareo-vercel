import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, AlertTriangle, Coins, Activity, ShieldCheck } from "lucide-react";

export function PortfolioHeader({ portfolio }: { portfolio: any[] }) {
    // Mock KPIs based on portfolio
    const totalInvested = portfolio.reduce((acc, inv) => acc + inv.amount, 0);
    const avgYield = 8.4; // Mock
    const netEarnings = 1240; // Mock
    const defaultRate = 0; // Mock

    // Diversification Score Logic (Mock: 10 points per investment, max 100)
    const activeInvestments = portfolio.filter(p => p.loan.status === 'FUNDED' || p.loan.status === 'ACTIVE').length;
    const diversificationScore = Math.min(activeInvestments * 20, 100); // 5 investments = 100%

    let healthColor = "text-red-500";
    if (diversificationScore >= 80) healthColor = "text-emerald-500";
    else if (diversificationScore >= 50) healthColor = "text-amber-500";

    const stats = [
        { label: "Encours Total", value: `${totalInvested.toLocaleString()} €`, icon: Wallet, color: "text-blue-500" },
        { label: "Rendement Moyen", value: `${avgYield}%`, icon: TrendingUp, color: "text-emerald-500" },
        { label: "Gains Nets", value: `+${netEarnings} €`, icon: Coins, color: "text-amber-500" },
        // New Health Card
        {
            label: "Santé Portfolio",
            value: `${diversificationScore}/100`,
            subValue: `Défaut: ${defaultRate}%`,
            icon: ShieldCheck,
            color: healthColor,
            isScore: true
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <Card key={i} className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 transition-all hover:shadow-lg">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                            <h3 className={`text-2xl font-bold mt-1 ${stat.isScore ? stat.color : 'text-zinc-900 dark:text-white'}`}>
                                {stat.value}
                            </h3>
                            {stat.subValue && <p className="text-xs text-zinc-400 mt-1">{stat.subValue}</p>}
                        </div>
                        <div className={`h-12 w-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
