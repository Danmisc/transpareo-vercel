import { Header } from "@/components/layout/Header";
import { DealMarketplace } from "@/components/p2p/DealMarketplace";
import { getAvailableLoans } from "@/lib/actions-p2p-loans";

export default async function P2PMarketplacePage() {
    const loans = await getAvailableLoans();

    return (
        <div className="space-y-8">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Opportunités d'Investissement</h1>
                    <p className="text-zinc-500">Sélectionnez les projets qui correspondent à votre profil de risque.</p>
                </div>
            </div>

            <DealMarketplace loans={loans} />
        </div>
    );
}
