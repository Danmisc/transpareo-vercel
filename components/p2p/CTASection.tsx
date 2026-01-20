import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 px-6 bg-white dark:bg-zinc-950">
            <div className="max-w-5xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-zinc-900 text-center py-20 px-6">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Prêt à boursicoter dans <br />
                            <span className="text-orange-500">l'immobilier</span> ?
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
                            Rejoignez 15 000 investisseurs et commencez à percevoir des intérêts dès le mois prochain. Inscription gratuite et sans engagement.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25">
                                Créer mon compte gratuit
                                <ArrowRight size={20} />
                            </Link>
                            <Link href="/p2p/market" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm transition-colors border border-white/10">
                                Voir les projets
                            </Link>
                        </div>

                        <p className="mt-8 text-xs text-zinc-500">
                            Investir comporte des risques. Prenez connaissance de la documentation avant d'investir.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

