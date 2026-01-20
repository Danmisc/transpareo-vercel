
export function StatsSection() {
    const stats = [
        { label: "Investis par la communauté", value: "47M€", sub: "Depuis 2021" },
        { label: "Rendement moyen annuel", value: "9.8%", sub: "Net de frais" },
        { label: "Projets remboursés", value: "100%", sub: "0 défaut constaté" },
        { label: "Investisseurs actifs", value: "15k+", sub: "En France" },
    ];

    return (
        <section className="py-12 border-y border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-100 dark:divide-zinc-900/50">
                    {stats.map((stat, i) => (
                        <div key={i} className={`text-center ${i !== 0 ? 'pl-8' : ''}`}>
                            <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                                {stat.value}
                            </div>
                            <div className="font-medium text-zinc-900 dark:text-white mb-1">
                                {stat.label}
                            </div>
                            <div className="text-sm text-zinc-500">
                                {stat.sub}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

