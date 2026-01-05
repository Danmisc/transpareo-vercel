import { SmartSimulator } from "@/components/p2p/SmartSimulator";
import { DealTicker } from "@/components/p2p/DealTicker";
import { Header } from "@/components/layout/Header";
import { LiveDeals } from "@/components/p2p/LiveDeals";
import { EligibilityTester } from "@/components/p2p/EligibilityTester";
import { ShieldCheck, Lock, Globe, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedHeroBackground } from "@/components/p2p/AnimatedHeroBackground";

export default function P2PUltimatePage() {
    return (
        <div className="min-h-screen bg-orange-50/30 dark:bg-black font-sans selection:bg-orange-500/30 overflow-x-hidden transition-colors duration-500">
            <Header />

            {/* --- HERO SECTION: THE VAULT --- */}
            <section className="relative pt-32 pb-32 overflow-hidden">
                <AnimatedHeroBackground />

                <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">

                    {/* Badge */}
                    <ScrollReveal delay={0.1} width="fit-content">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-orange-200 dark:border-white/10 backdrop-blur-md text-orange-700 dark:text-orange-400 text-sm font-bold mb-8 shadow-sm hover:shadow-md transition-all cursor-default">
                            <Globe size={14} />
                            <span>La Banque 3.0 est arrivée</span>
                        </div>
                    </ScrollReveal>

                    {/* Headline */}
                    <ScrollReveal delay={0.2} width="100%">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 leading-[0.9] md:leading-tight">
                            Votre argent.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 animate-gradient-x">
                                Sans intermédiaires.
                            </span>
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal delay={0.3} width="100%">
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
                            Financez des projets immobiliers vérifiés ou obtenez un prêt en 48h.
                            La puissance du pair-à-pair, sécurisée par la technologie Transpareo.
                        </p>
                    </ScrollReveal>

                    {/* SIMULATOR: CENTER STAGE */}
                    <ScrollReveal delay={0.4} width="100%" direction="none">
                        <div className="relative">
                            {/* Perspective glow behind simulator */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/10 dark:bg-orange-500/10 blur-[100px] -z-10 rounded-full opacity-40" />
                            <SmartSimulator />
                        </div>
                    </ScrollReveal>

                    {/* Trust Badges */}
                    <ScrollReveal delay={0.6} width="100%">
                        <div className="flex flex-wrap justify-center gap-8 mt-16 text-zinc-600 dark:text-zinc-500 font-medium">
                            <div className="flex items-center gap-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                <ShieldCheck className="text-orange-600 dark:text-orange-500" /> Sécurisé par Fiducie
                            </div>
                            <div className="flex items-center gap-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                <Lock className="text-orange-600 dark:text-orange-500" /> Blockchain Verified
                            </div>
                            <div className="flex items-center gap-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                <CheckCircle2 className="text-orange-600 dark:text-orange-500" /> Agrément AMF
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* --- REAL TIME MARKET --- */}
            <DealTicker />

            {/* --- LIVE DEALS --- */}
            <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/5 relative z-10 transition-colors duration-500">
                <ScrollReveal width="100%" direction="none">
                    <LiveDeals />
                </ScrollReveal>
            </div>

            {/* --- ELIGIBILITY --- */}
            <div className="relative z-10">
                <EligibilityTester />
            </div>

            {/* --- FOOTER CTA --- */}
            <section className="py-24 bg-gradient-to-b from-orange-50 to-white dark:from-zinc-900 dark:to-black text-center border-t border-zinc-200 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <ScrollReveal width="100%">
                    <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Prêt à changer la donne ?</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">Rejoignez les 15 000 membres qui ont déjà quitté le système bancaire traditionnel.</p>
                    <div className="flex justify-center gap-4">
                        <button className="px-8 py-4 bg-orange-600 text-white font-bold rounded-full hover:scale-105 transition-transform hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] duration-300">
                            Créer un compte Gratuit
                        </button>
                        <button className="px-8 py-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                            Parler à un expert
                        </button>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
