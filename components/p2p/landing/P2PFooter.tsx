import Link from "next/link";
import { Shield, Lock, FileCheck, ExternalLink } from "lucide-react";

export function P2PFooter() {
    return (
        <footer className="bg-zinc-950 text-white py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Trust Section */}
                <div className="flex flex-wrap justify-center gap-8 mb-12 pb-12 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Shield size={20} className="text-indigo-500" />
                        <span>Fonds ségrégés</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Lock size={20} className="text-indigo-500" />
                        <span>Chiffrement AES-256</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <FileCheck size={20} className="text-indigo-500" />
                        <span>Agrément AMF/PSFP</span>
                    </div>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <h3 className="font-semibold text-white mb-4">Investir</h3>
                        <ul className="space-y-2">
                            <li><Link href="/p2p/market" className="text-zinc-400 hover:text-white transition-colors">Catalogue</Link></li>
                            <li><Link href="/p2p/statistics" className="text-zinc-400 hover:text-white transition-colors">Statistiques</Link></li>
                            <li><Link href="/p2p/suitability" className="text-zinc-400 hover:text-white transition-colors">Test d'adéquation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Sécurité</h3>
                        <ul className="space-y-2">
                            <li><Link href="/p2p/legal/risks" className="text-zinc-400 hover:text-white transition-colors">Risques</Link></li>
                            <li><Link href="/p2p/legal/fees" className="text-zinc-400 hover:text-white transition-colors">Frais</Link></li>
                            <li><Link href="/p2p/cooling-off" className="text-zinc-400 hover:text-white transition-colors">Rétractation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Légal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/legal/terms" className="text-zinc-400 hover:text-white transition-colors">CGU</Link></li>
                            <li><Link href="/legal/privacy" className="text-zinc-400 hover:text-white transition-colors">Confidentialité</Link></li>
                            <li><Link href="/legal/cookies" className="text-zinc-400 hover:text-white transition-colors">Cookies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/help" className="text-zinc-400 hover:text-white transition-colors">Aide</Link></li>
                            <li><a href="mailto:support@transpareo.fr" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                                Email <ExternalLink size={12} />
                            </a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <span className="font-semibold">Transpareo</span>
                    </div>
                    <p className="text-sm text-zinc-500 text-center">
                        © {new Date().getFullYear()} Transpareo SAS. Tous droits réservés. Prestataire de Services de Financement Participatif agréé AMF.
                    </p>
                </div>

                {/* Risk Warning */}
                <div className="mt-8 p-4 rounded-lg bg-amber-900/20 border border-amber-800/50 text-center">
                    <p className="text-xs text-amber-400/80 leading-relaxed">
                        <strong>Avertissement :</strong> Investir comporte des risques de perte en capital. Les performances passées ne préjugent pas des performances futures.
                        Avant d'investir, assurez-vous de comprendre les risques liés à ce type de placement.
                    </p>
                </div>
            </div>
        </footer>
    );
}

