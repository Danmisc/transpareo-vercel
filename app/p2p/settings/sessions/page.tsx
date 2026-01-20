import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Monitor, Smartphone, Laptop, ArrowLeft, Trash2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SessionsSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Fetch active sessions
    const sessions = await prisma.session.findMany({
        where: { userId: user.id },
        orderBy: { expires: 'desc' },
        take: 10
    });

    // Mock device info from session (in real app, would store user agent info)
    const enrichedSessions = sessions.map((session, i) => ({
        ...session,
        device: i === 0 ? "Chrome sur Windows" : i === 1 ? "Safari sur iPhone" : "Application mobile",
        location: "Paris, France",
        isCurrent: i === 0,
        icon: i === 0 ? Laptop : i === 1 ? Smartphone : Monitor
    }));

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sessions actives</h1>
                    <p className="text-zinc-500 mt-1">Gérez vos connexions sur différents appareils</p>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Appareils connectés</CardTitle>
                    <CardDescription>
                        {sessions.length} session{sessions.length > 1 ? 's' : ''} active{sessions.length > 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {enrichedSessions.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4">Aucune session active</p>
                    ) : (
                        enrichedSessions.map((session) => {
                            const Icon = session.icon;
                            return (
                                <div
                                    key={session.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${session.isCurrent
                                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                                            : 'border-zinc-200 dark:border-zinc-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.isCurrent
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                : 'bg-zinc-100 dark:bg-zinc-800'
                                            }`}>
                                            <Icon size={20} className={session.isCurrent ? 'text-emerald-600' : 'text-zinc-600'} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-zinc-900 dark:text-white">
                                                    {session.device}
                                                </p>
                                                {session.isCurrent && (
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                                                        Actuelle
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <span>{session.location}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    Expire le {new Date(session.expires).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.isCurrent && (
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            <Button variant="destructive" className="w-full">
                Déconnecter tous les autres appareils
            </Button>
        </div>
    );
}

