import Link from "next/link";
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from "lucide-react";

export function FooterSection() {
    return (
        <footer className="bg-white dark:bg-black pt-20 pb-10 border-t border-zinc-100 dark:border-zinc-900">
            <div className="max-w-7xl mx-auto px-6">

                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                T
                            </div>
                            <span className="text-xl font-bold text-zinc-900 dark:text-white">Transpareo</span>
                        </div>
                        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                            La première plateforme sociale d'investissement immobilier. Démocratisons la finance, ensemble.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                                <a key={i} href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-orange-100 hover:text-orange-500 dark:hover:bg-zinc-800 transition-colors">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Investir</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><Link href="/p2p/market" className="hover:text-orange-500 transition-colors">Découvrir les projets</Link></li>
                            <li><Link href="/p2p/statistics" className="hover:text-orange-500 transition-colors">Statistiques</Link></li>
                            <li><Link href="/simulator" className="hover:text-orange-500 transition-colors">Simulateur</Link></li>
                            <li><Link href="/p2p/review" className="hover:text-orange-500 transition-colors">Avis clients</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Société</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><Link href="/about" className="hover:text-orange-500 transition-colors">À propos</Link></li>
                            <li><Link href="/careers" className="hover:text-orange-500 transition-colors">Carrières</Link></li>
                            <li><Link href="/blog" className="hover:text-orange-500 transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-orange-500 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Aide & Légal</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li className="flex items-center gap-2"><Mail size={14} /> help@transpareo.com</li>
                            <li className="flex items-center gap-2"><Phone size={14} /> 01 02 03 04 05</li>
                            <li><Link href="/legal/terms" className="hover:text-orange-500 transition-colors">CGU / CGV</Link></li>
                            <li><Link href="/legal/risks" className="hover:text-orange-500 transition-colors">Avertissement Risques</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-zinc-100 dark:border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
                    <p>© 2024 Transpareo SAS. Tous droits réservés.</p>
                    <p className="text-center md:text-right max-w-xl">
                        Avertissement: L'investissement dans des projets participatifs comporte des risques, notamment le risque de perte totale ou partielle du capital investi et le risque d'illiquidité.
                    </p>
                </div>

            </div>
        </footer>
    );
}

