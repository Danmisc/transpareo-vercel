import { auth } from "@/lib/auth";
import { getPropertyDetails } from "@/lib/actions-owner";
import { redirect } from "next/navigation";
import { PropertyDashboard } from "@/components/owner/property/PropertyDashboard";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    // Fetch detailed property data with KPIs
    const propertyData = await getPropertyDetails(id);

    if (!propertyData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-zinc-500">Bien immobilier introuvable ou accès non autorisé.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-20">
            <PropertyDashboard data={propertyData} />
        </div>
    );
}
