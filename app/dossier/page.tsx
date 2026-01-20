import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserDossier } from "@/lib/actions/dossier";
import { Header } from "@/components/layout/Header";
import { DossierDashboard } from "@/components/dossier/DossierDashboard"; // New Client Component

export default async function DossierPage() {
    const session = await auth();
    if (!session?.user) redirect("/");

    const { data: dossier } = await getUserDossier(session.user.id!);
    const documents = dossier?.documents || [];

    // Calculate Completion
    const requiredTypes = ["ID_CARD", "PAYSLIP", "TAX_RETURN", "PROOF_ADDRESS"];
    const presentTypes = new Set(documents.map((d: any) => d.type));
    const progress = Math.round((presentTypes.size / requiredTypes.length) * 100);

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <Header />
            <DossierDashboard
                user={session.user}
                dossier={dossier}
                documents={documents}
                progress={progress}
            />
        </div>
    );
}

