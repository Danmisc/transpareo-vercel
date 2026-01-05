import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { Header } from "@/components/layout/Header";

export default function MarketplacePage() {
    return (
        <div className="flex flex-col h-screen w-full">
            <div className="flex flex-1 relative overflow-hidden">
                <MarketplaceLayout header={<Header />} />
            </div>
        </div>
    );
}
