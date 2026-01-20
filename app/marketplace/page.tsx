import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";

export default async function MarketplacePage() {
    const session = await auth();
    return (
        <div className="flex flex-col h-screen w-full">
            <div className="flex flex-1 relative overflow-hidden">
                <MarketplaceLayout header={<Header user={session?.user} />} />
            </div>
        </div>
    );
}

