import { CommunityLeaderboard, LeaderboardUser } from "./CommunityLeaderboard";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Shield, ChevronRight, UserPlus, Image as ImageIcon } from "lucide-react";

interface CommunityInfoSidebarProps {
    community: any;
    admins: any[];
    mediaPreview?: any[];
    upcomingEvents?: any[];
    leaderboard?: LeaderboardUser[];
}

export function CommunityInfoSidebar({ community, admins, mediaPreview = [], upcomingEvents = [], leaderboard = [] }: CommunityInfoSidebarProps) {
    return (
        <aside className="hidden lg:flex flex-col space-y-6 w-80 shrink-0">

            {/* Leaderboard Widget (Gamification) */}
            <CommunityLeaderboard users={leaderboard} />

            {/* About / Stats Widget */}
            <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 backdrop-blur-sm p-5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">À propos</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                    {community.description || "Une communauté sur Transpareo."}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{community._count?.members || 0}</div>
                        <div className="text-xs text-zinc-500 font-medium">Membres</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{community._count?.posts || 0}</div>
                        <div className="text-xs text-zinc-500 font-medium">Posts</div>
                    </div>
                </div>
            </div>

            {/* Admins & Mods */}
            <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Staff</h3>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                        {admins.length}
                    </span>
                </div>
                <div className="space-y-3">
                    {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between group">
                            <Link href={`/profile/${admin.id}`} className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700">
                                    <AvatarImage src={admin.avatar} />
                                    <AvatarFallback>{admin.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {admin.name}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                        <Shield size={10} className="text-indigo-500" />
                                        {admin.role === "ADMIN" ? "Admin" : "Modérateur"}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Media Preview */}
            <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Médias récents</h3>
                    <Link href="?tab=media" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium flex items-center">
                        Voir tout <ChevronRight size={12} />
                    </Link>
                </div>
                {mediaPreview.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {mediaPreview.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 group cursor-pointer hover:ring-2 ring-indigo-500 transition-all">
                                <img src={src} alt="Media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                        <ImageIcon className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                        <p className="text-xs text-zinc-400">Aucune photo</p>
                    </div>
                )}
            </div>

            {/* Invite Prompt */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg shadow-indigo-500/20">
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm mb-1">Invitez vos amis</h3>
                        <p className="text-xs text-indigo-100 mb-3 leading-relaxed">
                            Faites grandir la communauté en invitant d'autres passionnés.
                        </p>
                        <Button size="sm" variant="secondary" className="w-full h-8 text-xs font-semibold bg-white text-indigo-600 hover:bg-white/90">
                            Copier le lien
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 text-[11px] text-zinc-400">
                <Link href="#" className="hover:underline">Règlement</Link>
                <Link href="#" className="hover:underline">Signaler</Link>
                <Link href="#" className="hover:underline">Confidentialité</Link>
                <span>© 2026 Transpareo</span>
            </div>
        </aside>
    );
}
