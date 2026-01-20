import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SubscriptionSettingsClient } from "./SubscriptionSettingsClient";
import { getUserSubscription } from "@/lib/subscription/service";

export const metadata = {
    title: "Mon Abonnement | Transpareo",
    description: "Gérez votre abonnement Transpareo"
};

export default async function SubscriptionSettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login?callbackUrl=/settings/subscription");
    }

    const subscriptionData = await getUserSubscription(session.user.id);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={session.user} />

            <main className="container max-w-4xl mx-auto px-4 pt-28 pb-16">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Mon Abonnement
                    </h1>
                    <p className="text-zinc-500">
                        Gérez votre plan et vos options de facturation
                    </p>
                </div>

                <SubscriptionSettingsClient
                    initialData={subscriptionData}
                    userId={session.user.id}
                />
            </main>
        </div>
    );
}

