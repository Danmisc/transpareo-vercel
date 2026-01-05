"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Megaphone, MessageSquare, ThumbsUp } from "lucide-react";

interface SocialFeedProps {
    activities: any[];
}

export function SocialFeed({ activities }: SocialFeedProps) {
    if (!activities || activities.length === 0) {
        return (
            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 border-dashed">
                <CardContent className="p-8 text-center">
                    <h4 className="font-bold text-zinc-400 mb-2">Activité Récente</h4>
                    <p className="text-sm text-zinc-500">
                        Aucune nouvelle récente de vos projets ou de votre réseau.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
            <CardContent className="p-6 space-y-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Megaphone size={18} className="text-orange-600" /> Fil d'actualité
                </h3>

                {activities.map((item) => (
                    <div key={item.id} className="border-b border-zinc-100 dark:border-white/5 pb-6 last:pb-0 last:border-0">
                        <div className="flex gap-3">
                            <Avatar className="h-10 w-10 border border-zinc-200">
                                <AvatarImage src={item.loan.borrower.image} />
                                <AvatarFallback>{item.loan.borrower.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="mb-1">
                                        <p className="font-bold text-sm text-zinc-900 dark:text-white">
                                            {item.loan.borrower.name}
                                            <span className="text-zinc-500 font-normal ml-2">a publié une mise à jour sur</span>
                                        </p>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {item.loan.title}
                                        </p>
                                    </div>
                                    <span className="text-xs text-zinc-400">{format(new Date(item.createdAt), "d MMM", { locale: fr })}</span>
                                </div>

                                <Card className="bg-zinc-50 dark:bg-zinc-800/50 border-none mt-2">
                                    <CardContent className="p-4">
                                        <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                            {item.content}
                                        </p>
                                        {item.imageUrl && (
                                            <img src={item.imageUrl} alt="Update" className="mt-3 rounded-lg w-full h-48 object-cover" />
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="flex gap-4 mt-3 text-zinc-500 text-xs font-medium">
                                    <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                                        <ThumbsUp size={14} /> J'aime
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                        <MessageSquare size={14} /> Commenter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
