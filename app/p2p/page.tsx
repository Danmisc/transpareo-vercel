
import { HeroSection } from "@/components/p2p/HeroSection";
import { InvestmentSimulator } from "@/components/p2p/simulator/InvestmentSimulator";
import { TrustMarquee } from "@/components/p2p/trust/TrustMarquee";
import { HowItWorks } from "@/components/p2p/HowItWorks";
import { ExpandingFeatures } from "@/components/p2p/ExpandingFeatures";
import { StatsSection } from "@/components/p2p/StatsSection";
import { FeaturedProjects } from "@/components/p2p/FeaturedProjects";
import { FAQSection } from "@/components/p2p/FAQSection";
import { CTASection } from "@/components/p2p/CTASection";
import { FooterSection } from "@/components/p2p/FooterSection";
import { auth } from "@/lib/auth";

export default async function P2PLandingPage() {
    const session = await auth();

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
            {/* Header is now Global in RootLayout (Transparent on /p2p) */}

            {/* Main Sections */}
            <main className="flex-grow">
                <HeroSection />
                <StatsSection />
                <InvestmentSimulator />
                <ExpandingFeatures />
                <HowItWorks />
                <FeaturedProjects />
                <FAQSection />
                <CTASection />
            </main>

            {/* Unified Footer */}
            <FooterSection />
        </div>
    );
}

