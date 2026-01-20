import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoanApplicationWizard } from "@/components/p2p/LoanApplicationWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewLoanPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background - Violet/Indigo Theme */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] right-[20%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Header with Back Button */}
                <div className="mb-8">
                    <Link href="/p2p/borrow">
                        <Button variant="ghost" size="sm" className="pl-0 hover:pl-0 hover:bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Retour
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
                        Nouvelle Demande
                    </h1>
                    <p className="text-sm text-zinc-500 max-w-xl">
                        Remplissez ce formulaire pour soumettre votre projet à notre comité d'investissement.
                    </p>
                </div>

                {/* Wizard Component */}
                <LoanApplicationWizard />

            </div>
        </div>
    );
}

