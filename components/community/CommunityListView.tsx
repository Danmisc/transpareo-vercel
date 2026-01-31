"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Lock, MapPin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface CommunityListViewProps {
    community: any;
    index: number;
}

export function CommunityListView({ community, index }: CommunityListViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/communities/${community.slug}`} className="block">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-orange-200 dark:hover:border-orange-900/30 transition-all duration-200">

                    {/* Avatar */}
                    <Avatar className="h-12 w-12 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <AvatarImage src={community.image} />
                        <AvatarFallback className="rounded-lg bg-orange-100 text-orange-600 font-bold">
                            {community.name[0]}
                        </AvatarFallback>
                    </Avatar>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                        {/* Title & Desc */}
                        <div className="md:col-span-4 min-w-0">
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-600 transition-colors">
                                {community.name}
                            </h3>
                            <p className="text-sm text-zinc-500 truncate">
                                {community.description || "Aucune description"}
                            </p>
                        </div>

                        {/* Category */}
                        <div className="col-span-2 hidden md:flex">
                            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                {community.category || "Général"}
                            </Badge>
                        </div>

                        {/* Stats & Meta */}
                        <div className="col-span-3 hidden md:flex items-center gap-4 text-sm text-zinc-500">
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>{community._count?.members || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span className="truncate max-w-[80px]">{community.location || "Global"}</span>
                            </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-1 hidden md:flex justify-end text-zinc-400">
                            {community.type === "PUBLIC" ? <Globe size={16} /> : <Lock size={16} />}
                        </div>

                        {/* Action */}
                        <div className="col-span-2 flex justify-end">
                            <Button size="sm" variant="ghost" className="text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                                Voir <ArrowRight size={14} className="ml-1" />
                            </Button>
                        </div>

                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
