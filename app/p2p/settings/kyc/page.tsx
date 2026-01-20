import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { KYCVerification } from "@/components/p2p/KYCVerification";
import { getKYCState } from "@/lib/banking/kyc";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function KYCPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const kycState = await getKYCState();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Vérification d&apos;Identité (KYC)</h1>
                    <p className="text-zinc-500 mt-1">Obligatoire pour investir et retirer des fonds</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <KYCVerification
                    currentStatus={kycState?.status || "IDLE"}
                    tier={kycState?.tier || 0}
                />
            </div>
        </div>
    );
}

