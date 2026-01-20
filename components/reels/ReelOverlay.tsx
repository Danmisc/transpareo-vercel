"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, MoreHorizontal, Music2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ReelOverlayProps {
    post: any;
    isActive: boolean;
    liked: boolean;
    likeCount: number;
    onLike: (e: React.MouseEvent) => void;
    onComment?: (e: React.MouseEvent) => void;
    onOpenProperty?: (e: React.MouseEvent) => void;
}

export function ReelOverlay({ post, isActive, liked, likeCount, onLike, onComment, onOpenProperty }: ReelOverlayProps) {
    const { data: session } = useSession();

    // Prevent propagation helper
    const stopProp = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4 pb-safe">
            {/* Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0" />

            <div className="flex items-end justify-between z-10 w-full mb-2">
                {/* Left: Info */}
                <div className="flex-1 pr-4 pointer-events-auto max-w-[85%]">

                    {/* User */}
                    <Link href={`/profile/${post.author?.id}`} onClick={stopProp} className="flex items-center gap-3 mb-3 group">
                        <Avatar className="h-9 w-9 border-2 border-white/80 cursor-pointer transition-transform group-hover:scale-105">
                            <AvatarImage src={post.author?.avatar} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="text-white font-bold text-sm drop-shadow-md cursor-pointer hover:underline">
                            {post.author?.name || "Utilisateur"}
                        </span>
                        <div className="text-white text-[10px] uppercase font-bold border border-white/40 px-2 py-0.5 rounded-md backdrop-blur-sm group-hover:bg-white/20 transition">
                            Suivre
                        </div>
                    </Link>

                    {/* Content */}
                    <div onClick={stopProp} className="mb-3">
                        <p className="text-white text-[15px] leading-snug line-clamp-2 drop-shadow-md font-medium">
                            {post.content} <span className="text-white/70 font-normal">#realestate #lyon #home</span>
                        </p>
                    </div>

                    {/* Property CTA - Only for Real Estate Posts */}
                    {post.type === "PROPERTY" && post.metadata && (
                        <div className="mb-4 pointer-events-auto" onClick={stopProp}>
                            <button
                                onClick={onOpenProperty}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <span className="animate-pulse w-2 h-2 bg-white rounded-full" />
                                Voir le bien
                            </button>
                        </div>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-white/95 text-xs font-medium">
                        <div className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 transition cursor-pointer" onClick={stopProp}>
                            <Music2 size={13} className="animate-pulse" />
                            <span className="max-w-[120px] truncate">Son original - {post.author?.name}</span>
                        </div>
                        {post.location && (
                            <div className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 transition cursor-pointer" onClick={stopProp}>
                                <MapPin size={13} />
                                <span>{post.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-center gap-6 pointer-events-auto pb-2">

                    {/* Like */}
                    <div className="flex flex-col items-center gap-1 group">
                        <button onClick={onLike} className="active:scale-75 transition-transform duration-200 p-2 -m-2">
                            <Heart size={30} className={cn("drop-shadow-lg transition-colors", liked ? "fill-red-500 text-red-500" : "text-white group-hover:text-zinc-200")} strokeWidth={2.5} />
                        </button>
                        <span className="text-white text-[13px] font-semibold tracking-tight">{likeCount}</span>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col items-center gap-1 group">
                        <button onClick={onComment} className="active:scale-75 transition-transform duration-200 p-2 -m-2">
                            <MessageCircle size={30} className="text-white drop-shadow-lg group-hover:text-zinc-200" strokeWidth={2.5} />
                        </button>
                        <span className="text-white text-[13px] font-semibold tracking-tight">{post._count?.comments || 0}</span>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col items-center gap-1 group">
                        <button className="active:scale-75 transition-transform duration-200 p-2 -m-2">
                            <Send size={30} className="text-white drop-shadow-lg -rotate-45 mb-1 group-hover:text-zinc-200" strokeWidth={2.5} />
                        </button>
                        <span className="text-white text-[13px] font-semibold tracking-tight">Partager</span>
                    </div>

                    <button className="mt-2 text-white/80 hover:text-white transition p-2">
                        <MoreHorizontal size={24} />
                    </button>

                    <div className="mt-4 w-9 h-9 rounded-md border-2 border-white/50 bg-zinc-800 overflow-hidden relative">
                        <img src={post.author?.avatar} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

