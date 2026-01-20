import { getTopContributors } from "@/lib/gamification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MiniBadge } from "./MiniBadge";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export async function Leaderboard() {
    const users = await getTopContributors(5);

    return (
        <Card className="bg-muted/50 border-none shadow-none">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Contributeurs
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {users.map((user: any, index: number) => (
                    <div key={user.id} className="flex items-center gap-3">
                        <div className="font-bold text-muted-foreground w-4 text-center">{index + 1}</div>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <Link href={`/profile/${user.id}`} className="font-medium text-sm hover:underline truncate block">
                                {user.name}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{user.reputation} pts</span>
                                {user.badges[0] && <MiniBadge badge={user.badges[0].badge} />}
                            </div>
                        </div>
                    </div>
                ))}
                {users.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                        Aucun classement pour le moment.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

