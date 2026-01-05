import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Trophy, Medal, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { DEMO_USER_ID } from "@/lib/constants";

export default async function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 md:pb-0">
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-yellow-200/20 rounded-full blur-3xl mix-blend-multiply opacity-50" />
            </div>

            <div className="hidden md:block">
                <Header />
            </div>

            <div className="container max-w-full xl:max-w-[1800px] mx-auto px-0 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr_350px] gap-6 lg:gap-12 pt-0 md:pt-6">
                    <aside className="hidden md:block sticky top-[5.5rem] h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none pb-10">
                        <SidebarLeft />
                    </aside>

                    <main className="flex flex-col gap-6 w-full max-w-3xl mx-auto md:mx-0 p-4 md:p-0">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                    <Trophy className="h-8 w-8 text-yellow-200" />
                                    Classement
                                </h1>
                                <p className="text-orange-100 max-w-lg">
                                    Découvrez les membres les plus actifs de la communauté Transpareo.
                                    Gagnez des points en participant pour grimper les échelons !
                                </p>
                            </div>
                            <Star className="absolute top-[-20px] right-[-20px] h-40 w-40 text-white/10 rotate-12" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex flex-col items-center text-center">
                                <span className="bg-orange-100 text-orange-600 p-2 rounded-full mb-2"><Medal className="h-5 w-5" /></span>
                                <span className="font-bold text-lg">10 pts</span>
                                <span className="text-xs text-muted-foreground">Par post</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex flex-col items-center text-center">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-full mb-2"><Medal className="h-5 w-5" /></span>
                                <span className="font-bold text-lg">2 pts</span>
                                <span className="text-xs text-muted-foreground">Par commentaire</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex flex-col items-center text-center">
                                <span className="bg-green-100 text-green-600 p-2 rounded-full mb-2"><Medal className="h-5 w-5" /></span>
                                <span className="font-bold text-lg">1 pt</span>
                                <span className="text-xs text-muted-foreground">Par like reçu</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6">
                            <h2 className="font-bold text-lg mb-4">Top Semaine</h2>
                            <Leaderboard />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
