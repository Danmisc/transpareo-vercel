
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OwnerDashboard } from "@/components/owner/OwnerDashboard";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";

import { getOwnerProperties } from "@/lib/actions-owner";

export const metadata = {
    title: "Espace Propriétaire - Transpareo",
    description: "Gérez vos biens immobiliers comme un pro.",
};

export const dynamic = 'force-dynamic';

export default async function OwnerPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login?callbackUrl=/owner");
    }

    const properties = await getOwnerProperties();

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <Header />
            <OwnerDashboard user={session.user} properties={properties} />
        </div>
    );
}
