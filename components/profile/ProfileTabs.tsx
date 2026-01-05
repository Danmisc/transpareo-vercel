"use client";

import { useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Grid, Image, Heart, MessageSquare, Bookmark, BookOpen } from "lucide-react";

interface ProfileTabsProps {
    defaultValue?: string;
    children: React.ReactNode;
}

export function ProfileTabs({ defaultValue = "posts", children }: ProfileTabsProps) {
    const [isPending, startTransition] = useTransition();

    return (
        <Tabs defaultValue={defaultValue} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-0 sm:gap-6 overflow-x-auto scrollbar-none">
                <TabsTrigger
                    value="posts"
                    className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
                >
                    <Grid className="h-4 w-4 mr-2" />
                    Publications
                </TabsTrigger>
                <TabsTrigger
                    value="media"
                    className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
                >
                    <Image className="h-4 w-4 mr-2" />
                    Médias
                </TabsTrigger>
                <TabsTrigger
                    value="likes"
                    className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
                >
                    <Heart className="h-4 w-4 mr-2" />
                    J'aime
                </TabsTrigger>
                <TabsTrigger
                    value="collections"
                    className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
                >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Collections
                </TabsTrigger>
            </TabsList>
            {children}
        </Tabs>
    );
}
