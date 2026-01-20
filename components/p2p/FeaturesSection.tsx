import { ShieldCheck, CalendarClock, PiggyBank, MousePointerClick, Search, Coins } from "lucide-react";

export function FeaturesSection() {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
                        Investir n'a jamais été aussi <span className="text-orange-500">simple</span>.
                    </h2>
                    <p className="text-lg text-zinc-500">
                        Notre plateforme sécurisée vous permet de placer votre argent dans l'économie réelle en quelques clics.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-24 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-500 to-orange-200 dark:from-orange-900 dark:via-orange-700 dark:to-orange-900 -z-0" />

                    {[
                        {
                            icon: MousePointerClick,
                            title: "1. Inscription Gratuite",
                            desc: "Créez votre compte en 2 minutes. Vérification d'identité 100% digitale et sécurisée."
                        },
                        {
                            icon: Search,
                            title: "2. Choisissez vos projets",
                            desc: "Accédez à des dossiers complets (audit, finances, plans) et investissez dès 100€."
                        },
                        {
                            icon: Coins,
                            title: "3. Recevez vos intérêts",
                            desc: "Percevez vos gains mensuellement sur votre wallet et réinvestissez-les."
                        }
                    ].map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <step.icon size={32} className="text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{step.title}</h3>
                            <p className="text-zinc-500 px-4">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Bento Grid Benefits */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <div className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">La sécurité avant tout</h3>
                        <p className="text-zinc-500 mb-6 max-w-lg">
                            Nous sommes agréés PSFP par l'Autorité des Marchés Financiers. Vos fonds sont cantonnés chez notre partenaire bancaire (Lemonway/Mangopay) et ne transitent jamais par nos comptes.
                        </p>
                        <ul className="space-y-3">
                            {['Agrément AMF', 'Paiements Sécurisés', 'Audit Rigoureux des Projets'].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Side Cards */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl bg-zinc-900 text-white shadow-xl">
                            <div className="mb-4 text-orange-400">
                                <PiggyBank size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">0€ de frais</h3>
                            <p className="text-zinc-400 text-sm">
                                L'investissement est 100% gratuit pour les investisseurs. Aucun frais d'entrée, de gestion ou de sortie.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl">
                            <div className="mb-4 text-white">
                                <CalendarClock size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Court Terme</h3>
                            <p className="text-white/80 text-sm">
                                Des projets d'une durée moyenne de 18 mois pour une rotation rapide de votre capital.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

