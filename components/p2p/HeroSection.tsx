
"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for readability */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                >
                    {/* Using a high-quality free stock video of modern architecture/city */}
                    <source src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Content Container */}
            <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6 pt-20">

                {/* Main Headline */}
                <h1 className="animate-fade-in-up animation-delay-100 text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter max-w-5xl drop-shadow-sm">
                    Faites travailler votre argent <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                        dans l'immobilier.
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="animate-fade-in-up animation-delay-200 text-lg md:text-xl text-white/90 max-w-xl mb-12 leading-relaxed font-light drop-shadow-md">
                    Investissez dans des projets auditées dès 100€. <br className="hidden md:block" />
                    Percevez vos intérêts chaque mois directement sur votre compte.
                </p>

                {/* CTA Buttons - Premium Glass Style */}
                <div className="animate-fade-in-up animation-delay-300 flex flex-col sm:flex-row gap-6 w-full max-w-lg items-center justify-center">
                    <Link
                        href="/register"
                        className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-zinc-100 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-white/20 flex items-center justify-center gap-2"
                    >
                        Créer un compte
                        <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="/p2p/market"
                        className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all hover:border-white/40 flex items-center justify-center"
                    >
                        Voir les projets
                    </Link>
                </div>

                {/* Bottom Ticker / Scrolling Text */}
                <div className="absolute bottom-0 left-0 w-full py-6 border-t border-white/5 bg-black/40 backdrop-blur-md overflow-hidden whitespace-nowrap">
                    <div className="flex animate-marquee gap-16 text-white/70 text-sm font-medium uppercase tracking-widest items-center">
                        {[...Array(2)].flatMap((_, i) => [
                            <span key={`1-${i}`} className="flex items-center gap-2">★ 0€ de frais d'entrée</span>,
                            <span key={`2-${i}`} className="text-white/20">•</span>,
                            <span key={`3-${i}`} className="flex items-center gap-2">★ Rendement cible 10-12%</span>,
                            <span key={`4-${i}`} className="text-white/20">•</span>,
                            <span key={`5-${i}`} className="flex items-center gap-2">★ Audit rigoureux</span>,
                            <span key={`6-${i}`} className="text-white/20">•</span>,
                            <span key={`7-${i}`} className="flex items-center gap-2">★ Sécurité bancaire</span>,
                            <span key={`8-${i}`} className="text-white/20">•</span>,
                            <span key={`9-${i}`} className="flex items-center gap-2">★ Accessibilité 24/7</span>,
                            <span key={`10-${i}`} className="text-white/20">•</span>,
                        ])}
                    </div>
                </div>
            </div>

            {/* Custom Animations Styles */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    opacity: 0; 
                }
                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </section>
    );
}

