"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MutualConnectionsProps {
    connections: { id: string; name: string; avatar: string }[];
}

export function MutualConnections({ connections }: MutualConnectionsProps) {
    if (!connections || connections.length === 0) return null;

    return (
        <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Connexions en commun</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex -space-x-2 overflow-hidden mb-3">
                    {connections.slice(0, 3).map((user) => (
                        <Avatar key={user.id} className="inline-block border-2 border-background w-8 h-8">
                            <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                    ))}
                    {connections.length > 3 && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                            +{connections.length - 3}
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    Vous connaissez <span className="font-semibold text-foreground">{connections[0].name}</span>
                    {connections.length > 1 && <> et <span className="font-semibold text-foreground">{connections.length - 1} autres</span></>}.
                </p>
            </CardContent>
        </Card>
    );
}

