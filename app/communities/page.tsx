
import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { getCommunities } from "@/lib/community-actions";
import { CreateCommunityDialog } from "@/components/community/CreateCommunityDialog";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Lock, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function CommunitiesPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const { data: communities } = await getCommunities();

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <div className="container grid flex-1 gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_320px] lg:gap-10 mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
                    <SidebarLeft className="sticky top-20 w-full" />
                </aside>

                <main className="flex w-full flex-1 flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Communautés</h1>
                            <p className="text-muted-foreground">Rejoignez des groupes locaux et thématiques.</p>
                        </div>
                        {userId && <CreateCommunityDialog userId={userId} />}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {communities?.map((community) => (
                            <Link key={community.id} href={`/communities/${community.slug}`}>
                                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <Avatar className="h-12 w-12 rounded-lg">
                                            <AvatarImage src={community.image || "/avatars/group-default.svg"} />
                                            <AvatarFallback className="rounded-lg">{community.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{community.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 text-xs">
                                                {community.type === "PUBLIC" ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                                {community.type === "PUBLIC" ? "Public" : "Privé"} • {community._count.members} membres
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {community.description || "Aucune description."}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                        {communities?.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                Aucune communauté pour le moment. Créez la première !
                            </div>
                        )}
                    </div>
                </main>

                <aside className="hidden w-[320px] flex-col lg:flex">
                    <SidebarRight />
                </aside>
            </div>
        </div>
    );
}

