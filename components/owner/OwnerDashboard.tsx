"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { OwnerSidebar } from "./OwnerSidebar";
import { OwnerOverview } from "./OwnerOverview";
import { OwnerProperties } from "./OwnerProperties";
import { OwnerTenants } from "./OwnerTenants";
import { OwnerFinancials } from "./OwnerFinancials";
import { OwnerMaintenance } from "./OwnerMaintenance";
import { OwnerLegal } from "./OwnerLegal";
import { OwnerDocuments } from "./OwnerDocuments";
import { CreatePropertyDialog } from "./CreatePropertyDialog";
import {
    Bell,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OwnerDashboardProps {
    user: any;
    properties?: any[];
}

export function OwnerDashboard({ user, properties = [] }: OwnerDashboardProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize tab from URL or default to overview
    const [activeTab, setActiveTabState] = useState(searchParams.get("tab") || "overview");

    // Sync URL when tab changes
    const setActiveTab = (tab: string) => {
        setActiveTabState(tab);
        const params = new URLSearchParams(searchParams);
        params.set("tab", tab);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full min-h-screen bg-zinc-50/50">
            {/* Full width container */}
            <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-start gap-0 md:gap-8 relative">

                    {/* Sidebar */}
                    <OwnerSidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />

                    {/* Main Content */}
                    <main className="flex-1 w-full min-w-0 space-y-8 pb-20 md:pb-0">

                        {/* Mobile Header (TODO: Mobile Sidebar Trigger) */}
                        <div className="lg:hidden flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Mon Espace Propriétaire</h1>
                        </div>

                        {/* Mobile Header (TODO: Mobile Sidebar Trigger) */}
                        <div className="lg:hidden flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Mon Espace Propriétaire</h1>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="animate-in fade-in duration-500">
                            {activeTab === "overview" && <OwnerOverview properties={properties} user={user} />}

                            {activeTab === "properties" && <OwnerProperties initialProperties={properties} />}

                            {activeTab === "tenants" && <OwnerTenants properties={properties} />}

                            {activeTab === "finance" && <OwnerFinancials />}

                            {activeTab === "maintenance" && <OwnerMaintenance />}

                            {activeTab === "legal" && <OwnerLegal />}

                            {activeTab === "documents" && <OwnerDocuments />}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
