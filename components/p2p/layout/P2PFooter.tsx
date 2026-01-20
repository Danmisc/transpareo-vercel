import Link from "next/link";
import {
    Shield,
    FileText,
    BarChart3,
    HelpCircle,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    Building2,
    Scale,
    Lock,
    CreditCard,
    BookOpen,
    AlertTriangle
} from "lucide-react";

export function P2PFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                <Building2 className="text-white" size={18} />
                            </div>
                            <span className="font-bold text-lg">Transpareo P2P</span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Plateforme de financement participatif régulée, connectant emprunteurs et investisseurs en toute transparence.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Shield size={14} className="text-emerald-600" />
                            <span>Agrément PSFP en cours</span>
                        </div>
                    </div>

                    {/* Investir */}
                    <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 size={16} className="text-orange-500" />
                            Investir
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/p2p/market" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">
                                    Projets disponibles
                                </Link>
                            </li>
                            <li>
                                <Link href="/p2p/suitability" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">
                                    Test d'adéquation
                                </Link>
                            </li>
                            <li>
                                <Link href="/p2p/statistics" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">
                                    Statistiques plateforme
                                </Link>
                            </li>
                            <li>
                                <Link href="/p2p/maturities" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">
                                    Calendrier échéances
                                </Link>
                            </li>
                            <li>
                                <Link href="/p2p/tax-report" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">
                                    Rapport fiscal
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Réglementation */}
                    <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Scale size={16} className="text-indigo-500" />
                            Réglementation
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/p2p/legal/risks" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors flex items-center gap-1">
                                    <AlertTriangle size={12} /> Notice des risques
                                </Link>
                            </li>
                            <li>
                                <Link href="/p2p/legal/fees" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors flex items-center gap-1">
                                    <CreditCard size={12} /> Grille tarifaire
                                </Link>
                            </li>
                            <li>
                                <Link href="/p2p/cooling-off" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors flex items-center gap-1">
                                    <Lock size={12} /> Droit de rétractation
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/privacy" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/terms" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">
                                    Conditions générales
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <HelpCircle size={16} className="text-emerald-500" />
                            Support
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Mail size={14} />
                                <a href="mailto:support@transpareo.com" className="hover:text-orange-600">
                                    support@transpareo.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Phone size={14} />
                                <span>01 23 45 67 89</span>
                            </li>
                            <li className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                                <MapPin size={14} className="mt-0.5" />
                                <span>123 Avenue de la Finance<br />75008 Paris, France</span>
                            </li>
                        </ul>
                        <div className="mt-4">
                            <Link href="/help" className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-500">
                                Centre d'aide <ExternalLink size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Warning Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Avertissement sur les risques :</strong> Le prêt participatif présente un risque de perte partielle ou totale du capital investi.
                            Les performances passées ne préjugent pas des performances futures. N'investissez que des sommes dont vous pouvez vous permettre de perdre l'intégralité.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-zinc-200 dark:bg-zinc-950 border-t border-zinc-300 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-4">
                            <span>© {currentYear} Transpareo. Tous droits réservés.</span>
                            <span className="hidden md:inline">|</span>
                            <span className="hidden md:inline">SIRET: 123 456 789 00012</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Shield size={12} className="text-emerald-500" />
                                Conforme EU ECSPR
                            </span>
                            <span className="flex items-center gap-1">
                                <Lock size={12} />
                                Données sécurisées
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

