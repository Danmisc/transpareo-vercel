import { Header } from "@/components/layout/Header";
import { getAllBadgesWithStatus } from "@/lib/gamification";
import { auth } from "@/lib/auth";
import { DEMO_USER_ID } from "@/lib/constants";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function BadgesPage() {
    const session = await auth();
    const userId = session?.user?.id || DEMO_USER_ID;

    const badges = await getAllBadgesWithStatus(userId) || []; // Default to empty array
    const unlockedCount = badges.filter(b => b.isUnlocked).length;
    const completionPercent = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans pb-20">
            <Header />

            <main className="container max-w-5xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href={`/profile/${userId}`} className={cn(buttonVariants({ variant: "ghost" }), "pl-0 hover:bg-transparent hover:underline text-muted-foreground")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour au profil
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Galerie des Trophées</h1>
                        <p className="text-muted-foreground">Collectionnez tous les badges pour prouver votre engagement !</p>
                    </div>

                    <Card className="p-4 w-full md:w-64 border-2 border-primary/10 bg-white">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span>Progression</span>
                            <span className="text-primary">{unlockedCount} / {badges.length}</span>
                        </div>
                        <Progress value={completionPercent} className="h-2" />
                    </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map((badge) => {
                        const IconComponent = (Icons as any)[badge.icon] || Icons.Award;
                        const isUnlocked = badge.isUnlocked;

                        return (
                            <div
                                key={badge.id}
                                className={cn(
                                    "relative group overflow-hidden rounded-xl border-2 transition-all duration-300 p-6 flex flex-col items-center text-center h-full",
                                    isUnlocked
                                        ? "bg-white border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300"
                                        : "bg-muted/30 border-dashed border-zinc-200 grayscale opacity-80 hover:opacity-100"
                                )}
                            >
                                {/* Glow Effect for Unlocked */}
                                {isUnlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}

                                <div className={cn(
                                    "mb-4 p-4 rounded-full transition-transform duration-300 group-hover:scale-110",
                                    isUnlocked ? "bg-orange-100 text-orange-600 ring-4 ring-orange-50" : "bg-zinc-200 text-zinc-400"
                                )}>
                                    {isUnlocked ? <IconComponent className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                                </div>

                                <h3 className={cn("font-bold text-lg mb-1", !isUnlocked && "text-muted-foreground")}>
                                    {badge.name}
                                </h3>

                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                    {badge.description}
                                </p>

                                <div className="mt-auto pt-4 border-t w-full border-dashed border-border/50">
                                    {isUnlocked ? (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            Obtenu le {new Date(badge.unlockedAt).toLocaleDateString()}
                                        </span>
                                    ) : (
                                        <div className="text-xs font-semibold text-primary/80 bg-primary/5 px-3 py-1.5 rounded-md inline-block">
                                            {badge.condition}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
