"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Globe, Lock, Users, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CommunityCardProps {
    community: any; // Type strictly in real app
    index?: number;
}

export function CommunityCard({ community, index = 0 }: CommunityCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Link href={`/communities/${community.slug}`} className="h-full block">
                <Card className="h-full overflow-hidden border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-300 group relative flex flex-col">

                    {/* Image / Banner Area */}
                    <div className="h-32 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                        {/* Gradient Overlay for Text readability if we had text here, but mostly for style */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />

                        {/* Abstract Placeholder or Real Image */}
                        {community.coverImage ? (
                            <img src={community.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 group-hover:from-indigo-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-colors" />
                        )}

                        <div className="absolute top-3 right-3 z-20">
                            <Badge variant="secondary" className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-[10px] font-bold shadow-sm h-6 px-2">
                                {community.category || "Général"}
                            </Badge>
                        </div>
                    </div>

                    {/* Avatar Overlap */}
                    <div className="px-5 relative z-20">
                        <div className="-mt-8 inline-block rounded-2xl p-1 bg-white dark:bg-zinc-900 shadow-sm">
                            <Avatar className="h-14 w-14 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <AvatarImage src={community.image} />
                                <AvatarFallback className="rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-500 text-lg font-bold">
                                    {community.name[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    <CardContent className="px-5 pt-3 pb-4 flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                {community.name}
                            </h3>
                            {community.isVerified && (
                                <div className="text-blue-500">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                            {community.description || "Une communauté passionnée prête à échanger, partager et grandir ensemble."}
                        </p>

                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs font-medium text-zinc-500 dark:text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <Users size={14} className="text-zinc-400" />
                                <span>{community._count?.members || 0} membres</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {community.type === "PUBLIC" ? (
                                    <>
                                        <Globe size={14} className="text-zinc-400" />
                                        <span>Public</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={14} className="text-zinc-400" />
                                        <span>Privé</span>
                                    </>
                                )}
                            </div>
                            {community.location && (
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <MapPin size={14} />
                                    <span className="truncate max-w-[100px]">{community.location}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex -space-x-2">
                                {/* Fake Avatars for "Friends here" feel */}
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-700/50 overflow-hidden flex items-center justify-center text-[8px] text-zinc-400">

                                    </div>
                                ))}
                                <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                    +
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                Rejoindre <ArrowRight size={12} />
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        </motion.div>
    );
}
