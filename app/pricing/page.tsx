import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { PricingPageClient } from "./PricingPageClient";
import { PricingHero } from "@/components/subscription/PricingHero";
import { PricingFeatures } from "@/components/subscription/PricingFeatures";
import { PricingComparison } from "@/components/subscription/PricingComparison";
import { PricingTestimonials } from "@/components/subscription/PricingTestimonials";
import { PricingFAQ } from "@/components/subscription/PricingFAQ";
import { PricingCTA } from "@/components/subscription/PricingCTA";
import { PricingFooter } from "@/components/subscription/PricingFooter";
import { BackToTop } from "@/components/ui/BackToTop";
import Link from "next/link";

export const metadata = {
    title: "Tarifs & Abonnements | Transpareo",
    description: "Choisissez le plan qui vous correspond pour débloquer toutes les fonctionnalités de Transpareo - La plateforme immobilière tout-en-un"
};

export default async function PricingPage() {
    const session = await auth();
    const currentPlan = (session?.user as any)?.currentPlan || "FREE";

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 selection:bg-orange-500/20">
            <Header transparent />

            {/* NEW: Hero Module */}
            <PricingHero />

            {/* Pricing Cards */}
            <section className="relative z-10 px-4 pb-0">
                <div className="max-w-6xl mx-auto">
                    <PricingPageClient currentPlan={currentPlan} />
                </div>
            </section>

            {/* NEW: Innovation Modules */}
            <PricingFeatures />
            <PricingComparison />

            {/* NEW: Testimonials */}
            <PricingTestimonials />

            {/* NEW: FAQ */}
            <PricingFAQ />

            {/* NEW: Final CTA */}
            <PricingCTA />

            {/* NEW: Hyper Design Footer */}
            <PricingFooter />

            <BackToTop />
        </div>
    );
}

