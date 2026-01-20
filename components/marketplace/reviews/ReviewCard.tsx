"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, ThumbsUp, ThumbsDown, Thermometer, Volume2, Shield, Wifi, UserCheck } from "lucide-react";

interface ReviewCardProps {
    review: {
        id: string;
        rating: number; // Global 1-5
        comment?: string;
        pros?: string;
        cons?: string;
        createdAt: Date;
        user: {
            name: string;
            image?: string;
        };
        isVerifiedTenant: boolean;

        // Detailed Scores
        thermalScore?: number;
        acousticScore?: number;
        safetyScore?: number;
        networkScore?: number;
        responsivenessScore?: number;
    };
}

export function ReviewCard({ review }: ReviewCardProps) {

    const getScoreColor = (score?: number) => {
        if (!score) return "bg-zinc-100 text-zinc-500";
        if (score >= 4) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        if (score === 3) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    };

    return (
        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900 mb-4 overflow-hidden rounded-2xl">
            <CardHeader className="p-4 pb-0 flex flex-row gap-4 items-start space-y-0">
                <Avatar className="h-10 w-10 border border-zinc-100">
                    <AvatarImage src={review.user.image || undefined} />
                    <AvatarFallback>{review.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                {review.user.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex text-amber-500">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} className={s <= review.rating ? "" : "text-zinc-300 dark:text-zinc-700"} />
                                    ))}
                                </div>
                                <span className="text-xs text-zinc-400">
                                    • {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: fr })}
                                </span>
                            </div>
                        </div>
                        {review.isVerifiedTenant && (
                            <Badge variant="outline" className="text-[10px] gap-1 border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-900">
                                <Shield size={10} className="fill-current" />
                                Locataire Vérifié
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 space-y-4">
                {/* Main Comment */}
                {review.comment && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {review.comment}
                    </p>
                )}

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {review.pros && (
                        <div className="text-xs bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                                <ThumbsUp size={12} /> Points Forts
                            </span>
                            <span className="text-zinc-600 dark:text-zinc-400">{review.pros}</span>
                        </div>
                    )}
                    {review.cons && (
                        <div className="text-xs bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                            <span className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                <ThumbsDown size={12} /> Points Faibles
                            </span>
                            <span className="text-zinc-600 dark:text-zinc-400">{review.cons}</span>
                        </div>
                    )}
                </div>

                {/* Detailed Scores Grid */}
                {(review.thermalScore || review.acousticScore || review.responsivenessScore) && (
                    <div className="flex gap-2 flex-wrap pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        {review.thermalScore && (
                            <Badge variant="secondary" className={`gap-1.5 ${getScoreColor(review.thermalScore)}`}>
                                <Thermometer size={12} /> Thermique: {review.thermalScore}/5
                            </Badge>
                        )}
                        {review.acousticScore && (
                            <Badge variant="secondary" className={`gap-1.5 ${getScoreColor(review.acousticScore)}`}>
                                <Volume2 size={12} /> Bruit: {review.acousticScore}/5
                            </Badge>
                        )}
                        {review.networkScore && (
                            <Badge variant="secondary" className={`gap-1.5 ${getScoreColor(review.networkScore)}`}>
                                <Wifi size={12} /> Internet: {review.networkScore}/5
                            </Badge>
                        )}
                        {review.responsivenessScore && (
                            <Badge variant="secondary" className={`gap-1.5 ${getScoreColor(review.responsivenessScore)}`}>
                                <UserCheck size={12} /> Proprio: {review.responsivenessScore}/5
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

